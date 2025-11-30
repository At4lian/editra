/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

const CLICKUP_API_TOKEN = process.env.CLICKUP_API_TOKEN!;
const CLICKUP_API_BASE = "https://api.clickup.com/api/v2";

// Volitelně: když si nastavíš CLICKUP_TEAM_ID, použije se ten.
// Když ne, vezmeme první tým z /team.
const CLICKUP_TEAM_ID = process.env.CLICKUP_TEAM_ID;

// ---------- Helper pro volání ClickUp API ----------

async function clickUpFetch(path: string, init?: RequestInit) {
  const url = `${CLICKUP_API_BASE}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: CLICKUP_API_TOKEN,
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[ClickUp] error", res.status, text);
    throw new Error(`ClickUp API error ${res.status}: ${text}`);
  }

  return res.json();
}

// ---------- Typy (jen aby se ti to líp psalo v TS) ----------

type ClickUpTeam = { id: string; name: string };
type ClickUpSpace = { id: string; name: string };
type ClickUpFolder = { id: string; name: string };
type ClickUpList = { id: string; name: string };

type ClickUpField = {
  id: string;
  name: string;
  type: string;
  // další věci nás teď nezajímají
};

type DebugListInfo = {
  id: string;
  name: string;
  spaceId: string;
  spaceName: string;
  folderId?: string | null;
  folderName?: string | null;
  fields: ClickUpField[];
};

type DebugSpaceInfo = {
  id: string;
  name: string;
  lists: DebugListInfo[];
};

type DebugOutput = {
  teamUsedId: string;
  teams: { id: string; name: string }[];
  spaces: DebugSpaceInfo[];
};

// ---------- Hlavní GET handler ----------

export async function GET(_req: NextRequest) {
  try {
    if (!CLICKUP_API_TOKEN) {
      return NextResponse.json(
        { error: "Missing CLICKUP_API_TOKEN env var" },
        { status: 500 }
      );
    }

    // 1) Zjisti týmy
    const teamData = await clickUpFetch("/team");
    const teams: ClickUpTeam[] = teamData.teams ?? [];

    if (teams.length === 0) {
      return NextResponse.json(
        { error: "No ClickUp teams found for this token" },
        { status: 500 }
      );
    }

    let teamId: string;
    if (CLICKUP_TEAM_ID) {
      const exists = teams.find((t) => t.id === CLICKUP_TEAM_ID);
      if (!exists) {
        console.warn(
          "[clickup-debug] CLICKUP_TEAM_ID env neodpovídá žádnému týmu, beru první."
        );
        teamId = teams[0].id;
      } else {
        teamId = CLICKUP_TEAM_ID;
      }
    } else {
      teamId = teams[0].id;
    }

    console.info("[clickup-debug] Teams:", teams);
    console.info("[clickup-debug] Using team:", teamId);

    // 2) Načti space v tomhle teamu
    const spacesData = await clickUpFetch(`/team/${teamId}/space?archived=false`);
    const spaces: ClickUpSpace[] = spacesData.spaces ?? [];

    const debugSpaces: DebugSpaceInfo[] = [];

    // 3) Pro každý space → složky → listy + listy mimo složky
    for (const space of spaces) {
      const listsForSpace: DebugListInfo[] = [];

      // 3a) Listy přímo ve space (bez složky)
      const spaceListsData = await clickUpFetch(
        `/space/${space.id}/list?archived=false`
      );
      const spaceLists: ClickUpList[] = spaceListsData.lists ?? [];

      for (const list of spaceLists) {
        const fieldsData = await clickUpFetch(`/list/${list.id}/field`);
        const fields: ClickUpField[] = fieldsData.fields ?? [];

        listsForSpace.push({
          id: list.id,
          name: list.name,
          spaceId: space.id,
          spaceName: space.name,
          folderId: null,
          folderName: null,
          fields: fields.map((f) => ({
            id: f.id,
            name: f.name,
            type: f.type,
          })),
        });
      }

      // 3b) Složky ve space → listy uvnitř
      const foldersData = await clickUpFetch(
        `/space/${space.id}/folder?archived=false`
      );
      const folders: ClickUpFolder[] = foldersData.folders ?? [];

      for (const folder of folders) {
        const folderListsData = await clickUpFetch(
          `/folder/${folder.id}/list?archived=false`
        );
        const folderLists: ClickUpList[] = folderListsData.lists ?? [];

        for (const list of folderLists) {
          const fieldsData = await clickUpFetch(`/list/${list.id}/field`);
          const fields: ClickUpField[] = fieldsData.fields ?? [];

          listsForSpace.push({
            id: list.id,
            name: list.name,
            spaceId: space.id,
            spaceName: space.name,
            folderId: folder.id,
            folderName: folder.name,
            fields: fields.map((f) => ({
              id: f.id,
              name: f.name,
              type: f.type,
            })),
          });
        }
      }

      debugSpaces.push({
        id: space.id,
        name: space.name,
        lists: listsForSpace,
      });
    }

    const output: DebugOutput = {
      teamUsedId: teamId,
      teams: teams.map((t) => ({ id: t.id, name: t.name })),
      spaces: debugSpaces,
    };

    // Pro jistotu log do server logu (kdybys to radši lovil tam)
    console.info(
      "[clickup-debug] Summary:",
      JSON.stringify(output, null, 2)
    );

    // Vrátíme JSON, ať to můžeš rovnou zkopírovat
    return NextResponse.json(output, { status: 200 });
  } catch (err: any) {
    console.error("[clickup-debug] ERROR:", err);
    return NextResponse.json(
      { error: "Internal error", message: err?.message },
      { status: 500 }
    );
  }
}
