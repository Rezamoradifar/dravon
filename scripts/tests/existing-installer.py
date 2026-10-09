from pathlib import Path
import tempfile, subprocess, tarfile, os
script=(Path(__file__).resolve().parents[2] / 'scripts/update-existing-dravon.sh').read_text()
for case in [False, True, 'reuse-success', 'reuse-failure', 'fresh-low-space', 'reuse-low-space']:
    failure = case is True or case == 'reuse-failure'
    reuse = isinstance(case, str) and case.startswith('reuse-')
    low_space = isinstance(case, str) and case.endswith('low-space')
    root=Path(tempfile.mkdtemp(prefix='dravon-installer-test-'))
    app=root/'app'; app.mkdir()
    for name in ['.next','node_modules','data']:
        (app/name).mkdir();(app/name/'marker').write_text('old')
    (app/'package.json').write_text('{}')
    (app/'page.txt').write_text('old')
    (app/'.env.local').write_text('KEEP_ME=1')
    release=root/'release';release.mkdir()
    (release/'package.json').write_text('{}');(release/'page.txt').write_text('new')
    (release/'package-lock.json').write_text('{}')
    (app/'package-lock.json').write_text('{}' if reuse else '{"different":true}')
    if reuse:
        executable_path=app/'node_modules/next/dist/bin/next'
        executable_path.parent.mkdir(parents=True)
        executable_path.write_text('existing dependency')
    archive=root/'archive.tgz'
    with tarfile.open(archive,'w:gz') as tar: tar.add(release,arcname='release')
    binary=root/'bin'; binary.mkdir()
    def executable(name,body):
        file=binary/name;file.write_text('#!/usr/bin/env bash\nset -e\n'+body);file.chmod(0o755)
    if low_space:
        free_kb = 3900000 if case == 'fresh-low-space' else 3000000
        executable('df', f'echo "Filesystem 1K-blocks Used Available Use% Mounted"; echo "fixture 10000000 5000000 {free_kb} 50% /"\n')
    executable('npm','mkdir -p node_modules; exit 0\n')
    executable('node', '''if [[ "$1" == "-e" ]]; then cat >/dev/null; fi
if [[ "$1" == "-" ]]; then
cat >/dev/null
mkdir -p .next; echo new > .next/BUILD_ID; echo new > .next/marker
fi
exit 0
''')
    executable('pm2',f'''if [[ "$1" == "stop" || "$1" == "restart" ]]; then echo "$*" >> '{root}/pm2-actions'; fi
if [[ "$1" == "jlist" ]]; then echo '[]'; fi
''')
    executable('curl',f'''for arg in "$@"; do
if [[ "$arg" == https://codeload.github.com/* ]]; then
while [[ "$1" != "-o" ]]; do shift; done
cp '{archive}' "$2"; exit 0
fi
done
'''+ ('if [[ "$*" == *"/dashboard"* ]]; then exit 22; fi\n' if failure else '')+'exit 0\n')
    test_script=script.replace('/root/dravon-main',str(app)).replace('/root/dravon-update-',str(root/'update-')).replace('/root/dravon-last-update-backup.txt',str(root/'last-backup.txt')).replace('/root/dravon-update.lock',str(root/'update.lock'))
    path=root/'update.sh';path.write_text(test_script)
    result=subprocess.run(['bash',str(path)],env={**os.environ,'PATH':str(binary)+':'+os.environ['PATH']},capture_output=True,text=True)
    if low_space:
        assert result.returncode == 1, result.stdout+result.stderr
        assert 'LOW_SPACE' in result.stdout
        assert not (root/'pm2-actions').exists(), 'low space must leave production running'
        assert (app/'page.txt').read_text() == 'old'
        continue
    assert result.returncode == (22 if failure else 0),result.stdout+result.stderr
    assert (app/'.env.local').read_text() == 'KEEP_ME=1'
    assert (app/'data/marker').read_text() == 'old'
    if reuse:
        assert not (app/'node_modules').is_symlink(), 'existing dependencies must never become a self-referential symlink'
        assert (app/'node_modules/next/dist/bin/next').read_text() == 'existing dependency'
    if failure:
        assert (app/'page.txt').read_text() == 'old'
        assert (app/'.next/marker').read_text() == 'old'
        assert (app/'node_modules/marker').read_text() == 'old'
    else:
        assert (app/'page.txt').read_text() == 'new'
        assert (app/'.next/marker').read_text().strip() == 'new'
        backup=Path((root/'last-backup.txt').read_text().strip())
        result=subprocess.run(['bash',str(backup/'rollback.sh')],env={**os.environ,'PATH':str(binary)+':'+os.environ['PATH']},capture_output=True,text=True)
        assert result.returncode == 0,result.stderr
        assert (app/'page.txt').read_text() == 'old'
        assert (app/'.next/marker').read_text() == 'old'
    actions=(root/'pm2-actions').read_text().splitlines()
    assert all(action in ['stop dravon','restart dravon'] for action in actions),actions
print('Passed installer fixtures: fresh/reused dependencies, successful update, manual/automatic rollback, preserved env/data, no dependency symlink replacement, only dravon touched. Services and build were mocked; no production deployment executed.')
