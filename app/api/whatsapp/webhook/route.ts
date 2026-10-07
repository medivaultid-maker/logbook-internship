import { NextRequest, NextResponse } from "next/server";

import {
  parseWhatsAppMessage,
} from "@/lib/whatsapp/parser";

import {
  mapWhatsAppToDatabase,
} from "@/lib/whatsapp/databaseMapper";

import { createClient } from "@supabase/supabase-js";


/* =========================================================
   GET
   Verifikasi webhook WhatsApp / Meta
========================================================= */

export async function GET(
  request: NextRequest
) {
  const searchParams =
    request.nextUrl.searchParams;

  const mode =
    searchParams.get("hub.mode");

  const token =
    searchParams.get("hub.verify_token");

  const challenge =
    searchParams.get("hub.challenge");

  const verifyToken =
    process.env.WHATSAPP_VERIFY_TOKEN;

  if (
    mode === "subscribe" &&
    token === verifyToken
  ) {
    return new NextResponse(
      challenge,
      {
        status: 200,
      }
    );
  }

  return NextResponse.json(
    {
      error:
        "Invalid verification token",
    },
    {
      status: 403,
    }
  );
}


/* =========================================================
   POST
   Menerima pesan WhatsApp
========================================================= */

export async function POST(
  request: NextRequest
) {
  try {

    /* =====================================================
       AMBIL AUTHORIZATION TOKEN
    ===================================================== */

    const authorization =
      request.headers.get(
        "authorization"
      );

    if (!authorization) {

      return NextResponse.json(
        {
          ok: false,
          message:
            "Authorization token tidak ditemukan.",
        },
        {
          status: 401,
        }
      );

    }


    const accessToken =
      authorization.replace(
        "Bearer ",
        ""
      );


    if (!accessToken) {

      return NextResponse.json(
        {
          ok: false,
          message:
            "Access token tidak ditemukan.",
        },
        {
          status: 401,
        }
      );

    }


    /* =====================================================
       BUAT SUPABASE CLIENT
       
       Token user diteruskan ke Supabase.
       Dengan ini RLS dapat membaca auth.uid().
    ===================================================== */

    const supabase =
      createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization:
                `Bearer ${accessToken}`,
            },
          },
        }
      );


    /* =====================================================
       VERIFIKASI USER
    ===================================================== */

    const {
      data: {
        user,
      },
      error: authError,
    } =
      await supabase.auth.getUser();


    if (
      authError ||
      !user
    ) {

      console.error(
        "AUTH ERROR:",
        authError
      );

      return NextResponse.json(
        {
          ok: false,
          message:
            "User login tidak valid.",
          error:
            authError?.message ??
            "User tidak ditemukan.",
        },
        {
          status: 401,
        }
      );

    }


    /*
      INI USER YANG BENAR-BENAR LOGIN.

      Jangan menggunakan user_id dari body
      sebagai sumber utama identitas user.
    */

    const userId =
      user.id;


    /* =====================================================
       AMBIL BODY
    ===================================================== */

    const body =
      await request.json();


    console.log(
      "================================"
    );

    console.log(
      "WHATSAPP WEBHOOK"
    );

    console.log(
      JSON.stringify(
        body,
        null,
        2
      )
    );

    console.log(
      "AUTH USER:",
      userId
    );

    console.log(
      "================================"
    );


    /* =====================================================
       AMBIL PESAN
    ===================================================== */

    const incomingText =
      body?.message?.text;


    if (!incomingText) {

      return NextResponse.json({
        ok: true,
        message:
          "Tidak ada pesan teks.",
      });

    }


    /* =====================================================
       PARSE PESAN
    ===================================================== */

    const parsed =
      parseWhatsAppMessage(
        incomingText
      );


    console.log(
      "PARSED:",
      JSON.stringify(
        parsed,
        null,
        2
      )
    );


    /* =====================================================
       CEK JENIS LOGBOOK
    ===================================================== */

    if (!parsed.type) {

      return NextResponse.json(
        {
          ok: false,
          message:
            "Jenis logbook tidak dikenali. Gunakan UKP, UKM, atau TM di baris pertama.",
        },
        {
          status: 400,
        }
      );

    }


    /* =====================================================
       MAP KE DATABASE
    ===================================================== */

    const mapped =
      mapWhatsAppToDatabase(
        parsed,
        userId
      );


    if (!mapped) {

      return NextResponse.json(
        {
          ok: false,
          message:
            "Data tidak dapat dipetakan.",
        },
        {
          status: 400,
        }
      );

    }


    console.log(
      "DATABASE TABLE:",
      mapped.table
    );

    console.log(
      "DATABASE DATA:",
      JSON.stringify(
        mapped.data,
        null,
        2
      )
    );


    /* =====================================================
       INSERT UKP
    ===================================================== */

    if (
      mapped.table ===
      "ukp_entries"
    ) {

      const {
        data,
        error,
      } = await supabase
        .from("ukp_entries")
        .insert(mapped.data)
        .select()
        .single();


      if (error) {

        console.error(
          "UKP INSERT ERROR:",
          error
        );

        return NextResponse.json(
          {
            ok: false,
            message:
              "Gagal menyimpan UKP.",
            error:
              error.message,
          },
          {
            status: 500,
          }
        );

      }


      return NextResponse.json({
        ok: true,

        type: "UKP",

        table:
          "ukp_entries",

        id:
          data.id,

        status:
          data.status,

        message:
          "Data UKP berhasil disimpan sebagai needs_review.",
      });

    }


    /* =====================================================
       INSERT UKM
    ===================================================== */

    if (
      mapped.table ===
      "ukm_entries"
    ) {

      const {
        data,
        error,
      } = await supabase
        .from("ukm_entries")
        .insert(mapped.data)
        .select()
        .single();


      if (error) {

        console.error(
          "UKM INSERT ERROR:",
          error
        );

        return NextResponse.json(
          {
            ok: false,
            message:
              "Gagal menyimpan UKM.",
            error:
              error.message,
          },
          {
            status: 500,
          }
        );

      }


      return NextResponse.json({
        ok: true,

        type: "UKM",

        table:
          "ukm_entries",

        id:
          data.id,

        status:
          data.status,

        message:
          "Data UKM berhasil disimpan sebagai needs_review.",
      });

    }


    /* =====================================================
       INSERT TINDAKAN MEDIS
    ===================================================== */

    if (
      mapped.table ===
      "tm_entries"
    ) {

      const {
        data,
        error,
      } = await supabase
        .from("tm_entries")
        .insert(mapped.data)
        .select()
        .single();


      if (error) {

        console.error(
          "TM INSERT ERROR:",
          error
        );

        return NextResponse.json(
          {
            ok: false,
            message:
              "Gagal menyimpan tindakan medis.",
            error:
              error.message,
          },
          {
            status: 500,
          }
        );

      }


      return NextResponse.json({
        ok: true,

        type: "TM",

        table:
          "tm_entries",

        id:
          data.id,

        status:
          data.status,

        message:
          "Data tindakan medis berhasil disimpan sebagai needs_review.",
      });

    }


    /* =====================================================
       FALLBACK
    ===================================================== */

    return NextResponse.json(
      {
        ok: false,
        message:
          "Tabel tujuan tidak dikenali.",
      },
      {
        status: 400,
      }
    );


  } catch (error) {

    console.error(
      "WHATSAPP WEBHOOK ERROR:",
      error
    );

    return NextResponse.json(
      {
        ok: false,

        message:
          "Terjadi kesalahan pada webhook.",

        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      {
        status: 500,
      }
    );

  }
}