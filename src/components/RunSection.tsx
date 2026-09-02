import { APPS } from '../data/apps';
import AppTile from './AppTile';

// The Run section (R3-514; FRONT_DOOR_IA §4.3) — M1's proof. The sandbox is not
// a topic beside "instant"; it is what makes instant safe, and placing the
// claim next to four real Open buttons is the proof. Four live tiles chosen
// for range and mobile-friendliness, whiteboard first; the three capability
// cards are kept from the old Safety section, tightened.

const RUN_TILES = ['whiteboard', 'kanban-board', 'sqlite-studio', 'chess'];

const RUN_APPS = RUN_TILES.map((repo) => APPS.find((a) => a.repo === repo)).filter(
  (a): a is (typeof APPS)[number] => Boolean(a),
);

function RunSection() {
  return (
    <section className="section" aria-labelledby="run">
      <div className="sec-head">
        <span className="tag">/RUN</span>
        <h2 id="run">Nothing to install. Nothing to trust first.</h2>
        <p className="lede">
          Every app runs in a sandboxed frame that starts with nothing: no files, no network, no
          keys. It gets exactly what you grant, when you grant it, and you can take that back. So
          clicking costs you nothing, whoever wrote the app.
        </p>
      </div>
      <div className="show-grid">
        {RUN_APPS.map((app) => (
          <AppTile key={app.repo} app={app} />
        ))}
      </div>
      <div className="cap-grid">
        <div className="cap">
          <div className="k">files</div>
          <div className="t">Mount, don't roam.</div>
          <p>An app sees only the folder you mount — never the rest of your disk.</p>
        </div>
        <div className="cap">
          <div className="k">network</div>
          <div className="t">Ask before reaching out.</div>
          <p>Every fetch to a new origin is a capability you consent to, once.</p>
        </div>
        <div className="cap">
          <div className="k">keys</div>
          <div className="t">Use a key, never read it.</div>
          <p>
            An app can <b className="key">use</b> your API key to make a call — it can never see
            the value.
          </p>
        </div>
      </div>
    </section>
  );
}

export default RunSection;
