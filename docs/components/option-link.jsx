import Link from 'next/link';

export const OptionLink = ({ type, name }) => {
  return (
    <Link
      href={`/docs/options/${type}-options#${name.toLowerCase()}`}
      className="whitespace-nowrap _text-primary-600 _underline _decoration-from-font [text-underline-position:from-font]"
    >
      <code class="nextra-code">{name}</code>
    </Link>
  );
};
