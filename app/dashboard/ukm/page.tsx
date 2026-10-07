import UkmForm from "@/components/UkmForm";

export default function UKMPage() {
  return (
    <main className="min-h-screen bg-slate-50">

      <div className="mx-auto max-w-5xl px-6 py-10">

        <div className="mb-8">
          <p className="text-sm font-semibold text-teal-600">
            LOGBOOK INTERNSIP
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            Tambah Data UKM
          </h1>

          <p className="mt-2 text-slate-500">
            Lengkapi data kegiatan Upaya Kesehatan
            Masyarakat.
          </p>
        </div>

        <UkmForm />

      </div>

    </main>
  );
}