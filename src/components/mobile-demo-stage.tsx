export function MobileDemoStage() {
  return <main className="mobile-demo-stage">
    <section className="mobile-demo-copy">
      <p className="eyebrow">Mobile recording studio</p>
      <h1>A real responsive PWA,<br />framed for the final film.</h1>
      <p>This hidden page runs the deployed app inside a 393 × 852 mobile viewport. Start your screen recorder first, then click once inside the phone. The 20-second sequence uses fictional data and fixed audio.</p>
      <div className="mobile-demo-actions">
        <strong>Start button → inside the phone</strong>
        <span>Record the whole window at 1920 × 1080. No emulator, DevTools, or phone is required.</span>
      </div>
      <div className="mobile-demo-points"><span>✓ Real mobile breakpoint</span><span>✓ Fixed English MP3</span><span>✓ No personal data</span></div>
    </section>
    <section className="iphone-shell" aria-label="iPhone-style frame showing the mobile PWA">
      <i className="iphone-side volume-one" /><i className="iphone-side volume-two" /><i className="iphone-side power" />
      <div className="iphone-screen"><div className="dynamic-island" aria-hidden="true" /><iframe title="Mobile What Mom Meant to Say demo" src="/?recording=mobile" allow="autoplay" /></div>
      <div className="home-indicator" aria-hidden="true" />
    </section>
  </main>;
}
