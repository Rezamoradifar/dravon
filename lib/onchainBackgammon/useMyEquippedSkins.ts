"use client";

import * as React from "react";

import { apiFetch, type ShopCatalogItem, type ShopMe } from "./api";

const DEFAULT_DICE_COLOR = "#ffffff";
const DEFAULT_BOARD_COLOR = "#2b1d12";

/** Resolves the signed-in wallet's currently-equipped dice/board skins to
 * actual CSS colors, for gameplay rendering (see Board/DiceTray). Falls
 * back to the default look for a signed-out visitor or before the fetch
 * resolves, rather than blocking the board on this. */
export function useMyEquippedSkins(token: string | null) {
  const [diceColorHex, setDiceColorHex] = React.useState(DEFAULT_DICE_COLOR);
  const [boardColorHex, setBoardColorHex] = React.useState(DEFAULT_BOARD_COLOR);

  React.useEffect(() => {
    if (!token) return;
    let cancelled = false;

    Promise.all([apiFetch<ShopCatalogItem[]>("/shop/items"), apiFetch<ShopMe>("/shop/me", { token })])
      .then(([items, me]) => {
        if (cancelled) return;
        const dice = items.find((i) => i.id === me.equipped.dice);
        const board = items.find((i) => i.id === me.equipped.board);
        if (dice) setDiceColorHex(dice.colorHex);
        if (board) setBoardColorHex(board.colorHex);
      })
      .catch(() => {
        // Keep the defaults - a fetch failure shouldn't block gameplay.
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  return { diceColorHex, boardColorHex };
}
