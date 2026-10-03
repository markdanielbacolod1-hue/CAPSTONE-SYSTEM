export default function FlowStep({ number, label, text }) {
  return (
    <article className="border-2 border-black bg-white p-4 shadow-[4px_4px_0_#f57696]">

      <p className="text-xs font-black text-[#d65075]">
        {number}
      </p>

      <h3 className="mt-6 font-black">
        {label}
      </h3>

      <p className="mt-1 text-xs leading-relaxed text-neutral-600">
        {text}
      </p>

    </article>
  );
}