export default function Notice({ icon, text }) {
  return (
    <article className="flex min-h-28 flex-col justify-between rounded-2xl bg-black p-5 text-white shadow-[5px_5px_0_#ffb0c3]">

      <div className="text-2xl font-black text-[#f57696]">
        {icon}
      </div>

      <p className="mt-4 text-sm font-bold leading-snug">
        {text}
      </p>

    </article>
  );
}