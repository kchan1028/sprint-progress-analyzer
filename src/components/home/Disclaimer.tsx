export function Disclaimer() {
  return (
    <section className="disclaimer" id="disclaimer" aria-labelledby="disclaimer-heading">
      <div className="disclaimer__inner">
        <h2 id="disclaimer-heading" className="disclaimer__heading">Disclaimer</h2>
        <p>This site is a personal project built for experimentation and learning purposes only.</p>
        <p>
          It is provided "as is," without warranties of any kind, express or implied. Features may break,
          change, or be removed without notice. Use it at your own risk - the maintainer is not liable for
          any damages, data loss, or issues arising from its use.
        </p>
        <p>This is not a production service and should not be relied on for anything important.</p>
      </div>
    </section>
  );
}
