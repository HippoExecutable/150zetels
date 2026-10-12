/*
    Parliament (parliament-seats) is a tool for visualizing and calculating
    the distribution of seats in a parliamentary system.

    Copyright (C) 2025 @disfordave

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published
    by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { Preset } from "@/types";

export const polls: Preset[] = [
  {
    name: "Ipsos I&O",
    updateDate: "2026-09-02",
    description: "<b>Zetelpeiling</b> van Ipsos I&O van 2 september 2026.\ntest",
    parties: [
      {
        id: "nl-ipsos-pvv",
        name: "Partij voor de Vrijheid",
        shortName: "PVV",
        seats: 17,
        colour: "#012758",
        position: 100,
        isIndependent: false,
      }, // Far-right
      {
        id: "nl-ipsos-vvd",
        name: "Volkspartij voor Vrijheid en Democratie",
        shortName: "VVD",
        seats: 20,
        colour: "#0A2CCA",
        position: 50,
        isIndependent: false,
      }, // Centre-right
      {
        id: "nl-ipsos-pro",
        name: "Progressief Nederland",
        shortName: "PRO",
        seats: 26,
        colour: "#ff0000",
        position: -50,
        isIndependent: false,
      }, // Centre-left
      {
        id: "nl-ipsos-d66",
        name: "Democraten 66",
        shortName: "D66",
        seats: 20,
        colour: "#00AE41",
        position: -25,
        isIndependent: false,
      }, // Lean left
      {
        id: "nl-ipsos-cda",
        name: "Christen-Democratisch Appèl",
        shortName: "CDA",
        seats: 14,
        colour: "#2CC84D",
        position: 25,
        isIndependent: false,
      }, // Centre
      {
        id: "nl-ipsos-bbb",
        name: "BoerBurgerBeweging",
        shortName: "BBB",
        seats: 2,
        colour: "#94C11F",
        position: 50,
        isIndependent: false,
      }, // Lean right
      {
        id: "nl-ipsos-volt",
        name: "Volt",
        shortName: "Volt",
        seats: 2,
        colour: "#582c83",
        position: -25,
        isIndependent: false,
      }, // Lean left
      {
        id: "nl-ipsos-pvdd",
        name: "Partij voor de Dieren",
        shortName: "PvdD",
        seats: 5,
        colour: "#006B2D",
        position: -75,
        isIndependent: false,
      }, // Centre-left
      {
        id: "nl-ipsos-cu",
        name: "ChristenUnie",
        shortName: "CU",
        seats: 3,
        colour: "#00A7EE",
        position: 25,
        isIndependent: false,
      }, // Centre
      {
        id: "nl-ipsos-sgp",
        name: "Staatkundig Gereformeerde Partij",
        shortName: "SGP",
        seats: 4,
        colour: "#EA5B0B",
        position: 75,
        isIndependent: false,
      }, // Right-wing
      {
        id: "nl-ipsos-fvd",
        name: "Forum voor Democratie",
        shortName: "FvD",
        seats: 12,
        colour: "#841818",
        position: 100,
        isIndependent: false,
      }, // Right-wing
      {
        id: "nl-ipsos-sp",
        name: "Socialistische Partij",
        shortName: "SP",
        seats: 5,
        colour: "#F60000",
        position: -75,
        isIndependent: false,
      }, // Left-wing
      {
        id: "nl-ipsos-denk",
        name: "Denk",
        shortName: "Denk",
        seats: 2,
        colour: "#00B7B2",
        position: -50,
        isIndependent: false,
      }, // Lean left
      {
        id: "nl-ipsos-ja21",
        name: "JA21",
        shortName: "JA21",
        seats: 14,
        colour: "#242B57",
        position: 75,
        isIndependent: false,
      },
      {
        id: "nl-ipsos-50plus",
        name: "50PLUS",
        shortName: "50PLUS",
        seats: 4,
        colour: "#92107D",
        position: 0,
        isIndependent: false,
      },
    ],
  },
  {
    name: "Verian/EenVandaag",
    updateDate: "2026-08-24",
    parties: [
      {
        id: "nl-verian-pvv",
        name: "Partij voor de Vrijheid",
        shortName: "PVV",
        seats: 16,
        colour: "#012758",
        position: 100,
        isIndependent: false,
      }, // Far-right
      {
        id: "nl-verian-vvd",
        name: "Volkspartij voor Vrijheid en Democratie",
        shortName: "VVD",
        seats: 19,
        colour: "#0A2CCA",
        position: 50,
        isIndependent: false,
      }, // Centre-right
      {
        id: "nl-verian-pro",
        name: "Progressief Nederland",
        shortName: "PRO",
        seats: 26,
        colour: "#ff0000",
        position: -50,
        isIndependent: false,
      }, // Centre-left
      {
        id: "nl-verian-d66",
        name: "Democraten 66",
        shortName: "D66",
        seats: 17,
        colour: "#00AE41",
        position: -25,
        isIndependent: false,
      }, // Lean left
      {
        id: "nl-verian-cda",
        name: "Christen-Democratisch Appèl",
        shortName: "CDA",
        seats: 15,
        colour: "#2CC84D",
        position: 25,
        isIndependent: false,
      }, // Centre
      {
        id: "nl-verian-bbb",
        name: "BoerBurgerBeweging",
        shortName: "BBB",
        seats: 2,
        colour: "#94C11F",
        position: 50,
        isIndependent: false,
      }, // Lean right
      {
        id: "nl-verian-volt",
        name: "Volt",
        shortName: "Volt",
        seats: 3,
        colour: "#582c83",
        position: -25,
        isIndependent: false,
      }, // Lean left
      {
        id: "nl-verian-pvdd",
        name: "Partij voor de Dieren",
        shortName: "PvdD",
        seats: 4,
        colour: "#006B2D",
        position: -75,
        isIndependent: false,
      }, // Centre-left
      {
        id: "nl-verian-cu",
        name: "ChristenUnie",
        shortName: "CU",
        seats: 4,
        colour: "#00A7EE",
        position: 25,
        isIndependent: false,
      }, // Centre
      {
        id: "nl-verian-sgp",
        name: "Staatkundig Gereformeerde Partij",
        shortName: "SGP",
        seats: 4,
        colour: "#EA5B0B",
        position: 75,
        isIndependent: false,
      }, // Right-wing
      {
        id: "nl-verian-fvd",
        name: "Forum voor Democratie",
        shortName: "FvD",
        seats: 13,
        colour: "#841818",
        position: 100,
        isIndependent: false,
      }, // Right-wing
      {
        id: "nl-verian-sp",
        name: "Socialistische Partij",
        shortName: "SP",
        seats: 5,
        colour: "#F60000",
        position: -75,
        isIndependent: false,
      }, // Left-wing
      {
        id: "nl-verian-denk",
        name: "Denk",
        shortName: "Denk",
        seats: 3,
        colour: "#00B7B2",
        position: -50,
        isIndependent: false,
      }, // Lean left
      {
        id: "nl-verian-ja21",
        name: "JA21",
        shortName: "JA21",
        seats: 14,
        colour: "#242B57",
        position: 75,
        isIndependent: false,
      },
      {
        id: "nl-verian-50plus",
        name: "50PLUS",
        shortName: "50PLUS",
        seats: 5,
        colour: "#92107D",
        position: 0,
        isIndependent: false,
      },
    ],
  },
  {
    name: "Maurice de Hond",
    updateDate: "2026-08-29",
    parties: [
      {
        id: "nl-peilnl-pvv",
        name: "Partij voor de Vrijheid",
        shortName: "PVV",
        seats: 18,
        colour: "#012758",
        position: 100,
        isIndependent: false,
      }, // Far-right
      {
        id: "nl-peilnl-vvd",
        name: "Volkspartij voor Vrijheid en Democratie",
        shortName: "VVD",
        seats: 16,
        colour: "#0A2CCA",
        position: 50,
        isIndependent: false,
      }, // Centre-right
      {
        id: "nl-peilnl-pro",
        name: "Progressief Nederland",
        shortName: "PRO",
        seats: 26,
        colour: "#ff0000",
        position: -50,
        isIndependent: false,
      }, // Centre-left
      {
        id: "nl-peilnl-d66",
        name: "Democraten 66",
        shortName: "D66",
        seats: 18,
        colour: "#00AE41",
        position: -25,
        isIndependent: false,
      }, // Lean left
      {
        id: "nl-peilnl-cda",
        name: "Christen-Democratisch Appèl",
        shortName: "CDA",
        seats: 13,
        colour: "#2CC84D",
        position: 25,
        isIndependent: false,
      }, // Centre
      {
        id: "nl-peilnl-bbb",
        name: "BoerBurgerBeweging",
        shortName: "BBB",
        seats: 1,
        colour: "#94C11F",
        position: 50,
        isIndependent: false,
      }, // Lean right
      {
        id: "nl-peilnl-volt",
        name: "Volt",
        shortName: "Volt",
        seats: 3,
        colour: "#582c83",
        position: -25,
        isIndependent: false,
      }, // Lean left
      {
        id: "nl-peilnl-pvdd",
        name: "Partij voor de Dieren",
        shortName: "PvdD",
        seats: 4,
        colour: "#006B2D",
        position: -75,
        isIndependent: false,
      }, // Centre-left
      {
        id: "nl-peilnl-cu",
        name: "ChristenUnie",
        shortName: "CU",
        seats: 3,
        colour: "#00A7EE",
        position: 25,
        isIndependent: false,
      }, // Centre
      {
        id: "nl-peilnl-sgp",
        name: "Staatkundig Gereformeerde Partij",
        shortName: "SGP",
        seats: 3,
        colour: "#EA5B0B",
        position: 75,
        isIndependent: false,
      }, // Right-wing
      {
        id: "nl-peilnl-fvd",
        name: "Forum voor Democratie",
        shortName: "FvD",
        seats: 17,
        colour: "#841818",
        position: 100,
        isIndependent: false,
      }, // Right-wing
      {
        id: "nl-peilnl-sp",
        name: "Socialistische Partij",
        shortName: "SP",
        seats: 4,
        colour: "#F60000",
        position: -75,
        isIndependent: false,
      }, // Left-wing
      {
        id: "nl-peilnl-denk",
        name: "Denk",
        shortName: "Denk",
        seats: 3,
        colour: "#00B7B2",
        position: -50,
        isIndependent: false,
      }, // Lean left
      {
        id: "nl-peilnl-ja21",
        name: "JA21",
        shortName: "JA21",
        seats: 17,
        colour: "#242B57",
        position: 75,
        isIndependent: false,
      },
      {
        id: "nl-peilnl-50plus",
        name: "50PLUS",
        shortName: "50PLUS",
        seats: 4,
        colour: "#92107D",
        position: 0,
        isIndependent: false,
      },
    ],
  },
];
