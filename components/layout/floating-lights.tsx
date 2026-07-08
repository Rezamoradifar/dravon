export function FloatingLights() {
  return (
    <div className="floating-lights" aria-hidden="true">
      <span style={{ top: "-10%", left: "5%", width: 420, height: 420 }} />
      <span
        style={{ top: "20%", right: "-8%", width: 380, height: 380, animationDelay: "-6s" }}
      />
      <span
        style={{ bottom: "-15%", left: "30%", width: 460, height: 460, animationDelay: "-12s" }}
      />
    </div>
  );
}
