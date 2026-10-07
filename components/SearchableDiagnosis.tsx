"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

type Diagnosis = {
  id: string;
  code: string | null;
  name: string;
};

type Props = {
  label: string;
  value: Diagnosis | null;
  onChange: (diagnosis: Diagnosis | null) => void;
  placeholder?: string;
};

export default function SearchableDiagnosis({
  label,
  value,
  onChange,
  placeholder = "Cari diagnosis...",
}: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Diagnosis[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  async function searchDiagnosis(
    text: string
  ) {
    setQuery(text);

    if (!text.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("master_diagnoses")
      .select("id, code, name")
      .ilike("name", `%${text}%`)
      .order("name")
      .limit(20);

    if (!error) {
      setResults(data || []);
    }

    setLoading(false);
  }

  function selectDiagnosis(
    diagnosis: Diagnosis
  ) {
    onChange(diagnosis);
    setQuery("");
    setResults([]);
    setOpen(false);
  }

  function clearDiagnosis() {
    onChange(null);
    setQuery("");
  }

  return (
    <div
      ref={wrapperRef}
      className="relative"
    >

      <label className="mb-2 block text-sm font-medium">
        {label}
      </label>

      {value ? (

        <div className="flex items-center justify-between rounded-xl border border-teal-200 bg-teal-50 px-4 py-3">

          <div>

            {value.code && (
              <div className="text-xs font-semibold text-teal-700">
                {value.code}
              </div>
            )}

            <div className="text-sm font-medium text-slate-900">
              {value.name}
            </div>

          </div>

          <button
            type="button"
            onClick={clearDiagnosis}
            className="ml-3 text-sm font-semibold text-red-500"
          >
            Hapus
          </button>

        </div>

      ) : (

        <>
          <input
            type="text"
            value={query}
            placeholder={placeholder}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setOpen(true);
              searchDiagnosis(
                e.target.value
              );
            }}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-teal-400 focus:bg-white"
          />

          {open && query.trim() && (

            <div className="absolute z-50 mt-2 max-h-80 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">

              {loading && (
                <div className="px-4 py-4 text-sm text-slate-500">
                  Mencari diagnosis...
                </div>
              )}

              {!loading &&
                results.length === 0 && (
                  <div className="px-4 py-4 text-sm text-slate-500">
                    Diagnosis tidak ditemukan.
                  </div>
                )}

              {!loading &&
                results.map((diagnosis) => (

                  <button
                    key={diagnosis.id}
                    type="button"
                    onClick={() =>
                      selectDiagnosis(
                        diagnosis
                      )
                    }
                    className="block w-full border-b border-slate-100 px-4 py-3 text-left transition hover:bg-teal-50"
                  >

                    {diagnosis.code && (
                      <div className="text-xs font-semibold text-teal-600">
                        {diagnosis.code}
                      </div>
                    )}

                    <div className="text-sm text-slate-900">
                      {diagnosis.name}
                    </div>

                  </button>

                ))}

            </div>

          )}

        </>

      )}

    </div>
  );
}