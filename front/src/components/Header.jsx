export default function Header({ onLogin }) {
  return (
    <header className="border-b-2 border-black bg-[#111] px-5 py-4 text-white sm:px-10 lg:px-16">
      <div className="mx-auto flex max-w-7xl items-center justify-between">

        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-[url('image-removebg-preview.png')] bg-cover bg-center border-2 border-white bg-[#f57696] text-black shadow-[3px_3px_0_#fff]"></div>

          <div className="leading-tight">
            <p className="text-xs font-black tracking-[0.16em]">
              UEP
            </p>

            <p className="text-sm font-extrabold">
              CULINARY ARCHIVE
            </p>
          </div>
        </div>

        <button
          onClick={onLogin}
          className="rounded-lg border-2 border-white bg-white px-5 py-2 text-sm font-black text-black transition hover:bg-[#f57696]"
        >
          LOG IN
        </button>

      </div>
    </header>
  );
}