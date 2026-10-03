import Notice from "./Notice";
import FlowStep from "./FlowStep";

export default function Home({ onLogin, onBrowse }) {
  return (
    <main>

      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-[#f57696] px-5 py-14 sm:px-10 lg:min-h-[570px] lg:px-16 lg:py-20">

        <div className="absolute bottom-0 right-0 -z-10 h-[62%] w-[25%] bg-white [clip-path:polygon(100%_0,100%_100%,0_100%)]" />

        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.15fr_.85fr] lg:items-center">

          <div>
            <p className="text-xs font-black tracking-[0.13em]">
              UEP HOSPITALITY MANAGEMENT
            </p>

            <h1 className="mt-3 max-w-xl text-5xl font-black leading-[.92] tracking-[-.06em] sm:text-7xl">
              Welcome!
              <br />
              HM <span className="text-white">STUDENTS</span>
            </h1>

            <p className="mt-6 max-w-lg text-sm font-bold sm:text-base">
              Web-Based Culinary Archive and Recipe Repository
              System for the UEP Hospitality Management program.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">

              <button
                onClick={onLogin}
                className="rounded-xl border-2 border-black bg-black px-6 py-3 text-sm font-black text-white shadow-[4px_4px_0_#fbd2dd] transition hover:translate-x-[2px] hover:translate-y-[2px]"
              >
                CONTINUE →
              </button>

              <button
                onClick={onBrowse}
                className="rounded-xl border-2 border-black bg-white px-5 py-3 text-sm font-black shadow-[4px_4px_0_#111] transition hover:translate-x-[2px] hover:translate-y-[2px]"
              >
                BROWSE RECIPES
              </button>

            </div>
          </div>

          {/* HERO GRAPHIC */}
          <div className="relative mx-auto w-full max-w-md">

            <div className="aspect-square rounded-full border-[10px] border-[#e62e87] bg-[#ffadd0] p-7 shadow-[8px_8px_0_#111]">

              <div className="grid h-full place-items-center rounded-full border-4 border-dashed border-white bg-[#f57696]">

                <div className="text-8xl">
                  ♨
                </div>

              </div>

            </div>

            <div className="absolute -bottom-6 -right-4 flex h-32 w-48 items-center justify-center border-4 border-black bg-white text-center shadow-[7px_7px_0_#111] sm:h-40 sm:w-56">

              <div>
                <div className="text-4xl text-[#f57696]">
                  ♨
                </div>

                <p className="mt-2 text-xs font-black">
                  BREAD & PASTRY
                </p>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ACCESS NOTICE */}
      <section className="bg-[#f57696] px-5 pb-12 sm:px-10 lg:px-16">

        <div className="mx-auto max-w-7xl">

          <p className="mb-4 text-sm font-black">
            ACCESS NOTICE
          </p>

          <div className="grid gap-4 md:grid-cols-3">

            <Notice
              icon="✓"
              text="Only Hospitality Management students may post recipes and lab outputs."
            />

            <Notice
              icon="♡"
              text="Community members can log in to comment, like, and save recipes."
            />

            <Notice
              icon="▣"
              text="Without an account you can browse and view recipes only."
            />

          </div>

        </div>
      </section>

      {/* WORKFLOW */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-10 lg:px-16">

        <div className="grid gap-10 md:grid-cols-2 md:items-center">

          <div>

            <p className="text-xs font-black tracking-[0.13em]">
              ONE SHARED WORKFLOW
            </p>

            <h2 className="mt-2 text-4xl font-black tracking-tight">
              From kitchen work
              <br />
              to lasting knowledge.
            </h2>

            <p className="mt-4 max-w-md text-neutral-600">
              Students submit their lab recipes, faculty review
              the work, and the wider community discovers,
              discusses, and saves the results.
            </p>

          </div>

          <div className="grid gap-3 sm:grid-cols-3">

            <FlowStep
              number="01"
              label="Submit"
              text="Students post outputs and declare originality."
            />

            <FlowStep
              number="02"
              label="Review"
              text="Faculty review and archive culinary outputs."
            />

            <FlowStep
              number="03"
              label="Engage"
              text="Members like, save, and discuss recipes."
            />

          </div>

        </div>
      </section>

      {/* ARCHIVE */}
      <section className="border-y-2 border-black bg-[#111] px-5 py-12 text-white sm:px-10 lg:px-16">

        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 md:flex-row md:items-center">

          <div>

            <p className="text-xs font-black tracking-[0.13em] text-[#f57696]">
              EXPLORE THE COLLECTION
            </p>

            <h2 className="mt-2 text-3xl font-black">
              Find recipes made by your community.
            </h2>

          </div>

          <button
            onClick={onBrowse}
            className="rounded-xl bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-[#f57696]"
          >
            Search the archive →
          </button>

        </div>

      </section>

    </main>
  );
}