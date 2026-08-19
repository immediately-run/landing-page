// The MDX `<ApiSignature>` — one SDK method: signature, the capability it needs, its
// parameters, what it returns, and how it can reject.
//
// Params and rejections stay STRUCTURED (JSX expression props) rather than becoming prose.
// They are tabular data with a fixed shape that the machine surface also reads; turning them
// into paragraphs would be the mistake the conversion is meant to avoid, in the other
// direction. MDX is for the prose around them.

import SiteLink from '../components/SiteLink';

export interface ApiParam {
  name: string;
  type: string;
  desc: string;
}

export interface ApiRejection {
  code: string;
  meaning: string;
}

export default function ApiSignature({
  id,
  sig,
  cap,
  capHref,
  params = [],
  returns,
  rejections = [],
}: {
  id?: string;
  toc?: string;
  sig?: string;
  cap?: string;
  capHref?: string;
  params?: ApiParam[];
  returns?: string;
  rejections?: ApiRejection[];
}) {
  return (
    <div className="docs-api" id={id}>
      <div className="docs-api-head">
        <code className="docs-api-sig">{sig}</code>
        <div>
          <SiteLink className="docs-cap-chip" to={(capHref ?? '').replace(/^#/, '')}>
            Requires the {cap} capability
          </SiteLink>
        </div>
      </div>
      <div className="docs-api-body">
        {params.length > 0 && (
          <>
            <div className="docs-api-label">Parameters</div>
            {params.map((p) => (
              <div className="docs-param" key={p.name}>
                <div>
                  <code className="docs-param-name">{p.name}</code>
                  <div className="docs-param-type">{p.type}</div>
                </div>
                <div className="docs-param-desc">{p.desc}</div>
              </div>
            ))}
          </>
        )}
        <div className="docs-api-label docs-api-label--mt">Returns</div>
        <div className="docs-returns">{returns}</div>
        <div className="docs-api-label docs-api-label--mt">Rejection codes</div>
        {rejections.map((r) => (
          <div className="docs-reject" key={r.code}>
            <code className="docs-reject-code">{r.code}</code>
            <span className="docs-reject-meaning">{r.meaning}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
