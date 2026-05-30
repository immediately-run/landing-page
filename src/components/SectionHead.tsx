interface SectionHeadProps {
  /** Anchor id used by the nav links. */
  id: string;
  /** Mono "/slug" tag. */
  tag: string;
  title: string;
  /** Right-aligned link label. */
  link: string;
}

function SectionHead({ id, tag, title, link }: SectionHeadProps) {
  return (
    <div className="sechead" id={id}>
      <span className="tag">{tag}</span>
      <h2>{title}</h2>
      <a href="#">{link}</a>
    </div>
  );
}

export default SectionHead;
