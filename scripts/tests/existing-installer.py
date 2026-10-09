from pathlib import Path
import tempfile, subprocess, tarfile, os
script=(Path(__file__).resolve().parents[2] / 'scripts/update-existing-dravon.sh').read_text()
for failure in [False, True]:
    root=Path(tempfile.mkdtemp(prefix='dravon-installer-test-'))
    app=root/'app'; app.mkdir()
    for name in ['.next','node_modules','data']:
        (app/name).mkdir();(app/name/'marker').write_text('old')
    (app/'package.json').write_text('{}')
    (app/'page.txt').write_text('old')
    (app/'.env.local').write_text('KEEP_ME=1')
    release=root/'release';release.mkdir()
    (release/'package.json').write_text('{}');(release/'page.txt').write_text('new')
    archive=root/'archive.tgz'
    with tarfile.open(archive,'w:gz') as tar: tar.add(release,arcname='release')
    binary=root/'bin'; binary.mkdir()
    def executable(name,body):
        file=binary/name;file.write_text('#!/usr/bin/env bash\nset -e\n'+body);file.chmod(0o755)
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
    test_script=script.replace('/root/dravon-main',str(app)).replace('/root/dravon-update-',str(root/'update-')).replace('/root/dravon-last-update-backup.txt',str(root/'last-backup.txt'))
    path=root/'update.sh';path.write_text(test_script)
    result=subprocess.run(['bash',str(path)],env={**os.environ,'PATH':str(binary)+':'+os.environ['PATH']},capture_output=True,text=True)
    assert result.returncode == (22 if failure else 0),result.stdout+result.stderr
    assert (app/'.env.local').read_text() == 'KEEP_ME=1'
    assert (app/'data/marker').read_text() == 'old'
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
print('Passed installer fixtures: successful update, manual rollback, failed health check rollback, preserved env/data, only dravon touched. Services and build were mocked; no production deployment executed.')
