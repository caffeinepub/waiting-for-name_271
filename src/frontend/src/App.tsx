import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { addDays, format } from "date-fns";
import {
  ArrowLeftRight,
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  Filter,
  Globe,
  MapPin,
  Moon,
  Plane,
  Search,
  Star,
  Sun,
  Sunrise,
  Sunset,
  Users,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { type Airport, airports } from "./data/airports";

// ---- Booking Sites ----
const BOOKING_SITES = [
  {
    id: "ixigo",
    name: "Ixigo",
    emoji: "🔵",
    color: "#FF6B35",
    url: "https://www.ixigo.com",
  },
  {
    id: "goibibo",
    name: "Goibibo",
    emoji: "🟢",
    color: "#2ECC71",
    url: "https://www.goibibo.com",
  },
  {
    id: "mmt",
    name: "MakeMyTrip",
    emoji: "🔴",
    color: "#E74C3C",
    url: "https://www.makemytrip.com",
  },
  {
    id: "ndc",
    name: "NDC Flights",
    emoji: "🟣",
    color: "#9B59B6",
    url: "https://www.ndcflights.com",
  },
  {
    id: "cleartrip",
    name: "Cleartrip",
    emoji: "🟠",
    color: "#E67E22",
    url: "https://www.cleartrip.com",
  },
  {
    id: "agoda",
    name: "Agoda",
    emoji: "🟡",
    color: "#F39C12",
    url: "https://www.agoda.com/flights",
  },
  {
    id: "easetrip",
    name: "EaseMyTrip",
    emoji: "⚪",
    color: "#1ABC9C",
    url: "https://www.easemytrip.com",
  },
  {
    id: "booking",
    name: "Booking.com",
    emoji: "🔷",
    color: "#003580",
    url: "https://www.booking.com/flights",
  },
];

// ---- Types ----
interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  stopCity?: string;
  basePrice: number;
  logo: string;
  sitePrices: Record<string, number>;
}

const AIRLINES = [
  { name: "Delta Air Lines", code: "DL", logo: "✈" },
  { name: "American Airlines", code: "AA", logo: "✈" },
  { name: "United Airlines", code: "UA", logo: "✈" },
  { name: "Emirates", code: "EK", logo: "✈" },
  { name: "Lufthansa", code: "LH", logo: "✈" },
  { name: "British Airways", code: "BA", logo: "✈" },
  { name: "Air France", code: "AF", logo: "✈" },
  { name: "Singapore Airlines", code: "SQ", logo: "✈" },
  { name: "Qatar Airways", code: "QR", logo: "✈" },
  { name: "Turkish Airlines", code: "TK", logo: "✈" },
  { name: "IndiGo", code: "6E", logo: "✈" },
  { name: "Air India", code: "AI", logo: "✈" },
  { name: "Vistara", code: "UK", logo: "✈" },
  { name: "SpiceJet", code: "SG", logo: "✈" },
  { name: "Thai Airways", code: "TG", logo: "✈" },
  { name: "Cathay Pacific", code: "CX", logo: "✈" },
  { name: "ANA", code: "NH", logo: "✈" },
  { name: "Japan Airlines", code: "JL", logo: "✈" },
];

const STOP_CITIES = [
  "Dubai",
  "Frankfurt",
  "London",
  "Amsterdam",
  "Doha",
  "Istanbul",
  "Singapore",
  "Bangkok",
  "Hong Kong",
];

const POPULAR_DESTINATIONS = [
  { iata: "LHR", city: "London", country: "UK", price: 34860, emoji: "🎡" },
  { iata: "CDG", city: "Paris", country: "France", price: 32370, emoji: "🗼" },
  { iata: "JFK", city: "New York", country: "USA", price: 56440, emoji: "🗽" },
  { iata: "DXB", city: "Dubai", country: "UAE", price: 25730, emoji: "🌆" },
  { iata: "NRT", city: "Tokyo", country: "Japan", price: 73870, emoji: "🗾" },
  {
    iata: "BKK",
    city: "Bangkok",
    country: "Thailand",
    price: 22410,
    emoji: "🏯",
  },
  {
    iata: "SIN",
    city: "Singapore",
    country: "Singapore",
    price: 28220,
    emoji: "🦁",
  },
  {
    iata: "SYD",
    city: "Sydney",
    country: "Australia",
    price: 79680,
    emoji: "🦘",
  },
  {
    iata: "DPS",
    city: "Bali",
    country: "Indonesia",
    price: 39840,
    emoji: "🌴",
  },
  {
    iata: "MLE",
    city: "Maldives",
    country: "Maldives",
    price: 59760,
    emoji: "🐠",
  },
  { iata: "FCO", city: "Rome", country: "Italy", price: 29880, emoji: "🏛️" },
  {
    iata: "BCN",
    city: "Barcelona",
    country: "Spain",
    price: 27390,
    emoji: "🎨",
  },
];

const TIME_SLOTS = [
  { id: "early", label: "Early Morning", sub: "12am – 6am", icon: Moon },
  { id: "morning", label: "Morning", sub: "6am – 12pm", icon: Sunrise },
  { id: "afternoon", label: "Afternoon", sub: "12pm – 6pm", icon: Sun },
  { id: "night", label: "Evening", sub: "6pm – 12am", icon: Sunset },
];

function getTimeSlot(time: string): string {
  const [h] = time.split(":").map(Number);
  if (h < 6) return "early";
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "night";
}

function parseDurationHours(duration: string): number {
  const match = duration.match(/(\d+)h\s*(\d+)?m?/);
  if (!match) return 0;
  const hours = Number.parseInt(match[1] ?? "0");
  const mins = Number.parseInt(match[2] ?? "0");
  return hours + mins / 60;
}

function formatINR(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

// ---- Generate Flights ----
function generateFlights(origin: Airport, destination: Airport): Flight[] {
  const basePriceMap: Record<number, number> = {
    1: 41500,
    2: 29050,
    3: 20750,
    4: 14940,
  };
  const tierPenalty =
    (basePriceMap[origin.tier] + basePriceMap[destination.tier]) / 2;
  const base = Math.max(6640, tierPenalty * (0.5 + Math.random()));

  return Array.from({ length: 9 }, (_, i) => {
    const airline = AIRLINES[Math.floor(Math.random() * AIRLINES.length)];
    const stops = Math.random() < 0.4 ? 0 : 1;
    const depHour = 4 + Math.floor(Math.random() * 20);
    const depMin = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
    const flightHours = 2 + Math.floor(Math.random() * 14);
    const flightMins = [0, 20, 40][Math.floor(Math.random() * 3)];
    const arrivalHour = (depHour + flightHours + (stops > 0 ? 2 : 0)) % 24;
    const arrivalMin = (depMin + flightMins) % 60;
    const priceVariance = 0.7 + Math.random() * 0.9;
    const basePrice = Math.round(base * priceVariance);

    const sitePrices: Record<string, number> = {};
    for (const site of BOOKING_SITES) {
      const variation = 1 + (Math.random() * 0.2 - 0.1);
      sitePrices[site.id] = Math.round(basePrice * variation);
    }

    return {
      id: `fl-${i}`,
      airline: airline.name,
      flightNumber: `${airline.code}${100 + Math.floor(Math.random() * 900)}`,
      departureTime: `${String(depHour).padStart(2, "0")}:${String(depMin).padStart(2, "0")}`,
      arrivalTime: `${String(arrivalHour).padStart(2, "0")}:${String(arrivalMin).padStart(2, "0")}`,
      duration: `${flightHours + (stops > 0 ? 2 : 0)}h ${flightMins}m`,
      stops,
      stopCity:
        stops > 0
          ? STOP_CITIES[Math.floor(Math.random() * STOP_CITIES.length)]
          : undefined,
      basePrice,
      logo: airline.logo,
      sitePrices,
    };
  }).sort((a, b) => a.basePrice - b.basePrice);
}

// ---- Date Matrix (2D Round-trip Fare Matrix) ----
function DateMatrix({
  departDate,
  returnDate,
  onSelectDepartDate,
  onSelectReturnDate,
}: {
  departDate: Date;
  returnDate: Date;
  onSelectDepartDate: (d: Date) => void;
  onSelectReturnDate: (d: Date) => void;
}) {
  const [returnOffset, setReturnOffset] = useState(0);
  const [departOffset, setDepartOffset] = useState(0);

  // Generate 7 depart rows centered around departDate + departOffset*7
  const departRows = useMemo(() => {
    const center = addDays(departDate, departOffset * 7);
    return Array.from({ length: 7 }, (_, i) => addDays(center, i - 3));
  }, [departDate, departOffset]);

  // Generate 7 return columns centered around returnDate + returnOffset*7
  const returnCols = useMemo(() => {
    const center = addDays(returnDate, returnOffset * 7);
    return Array.from({ length: 7 }, (_, i) => addDays(center, i - 3));
  }, [returnDate, returnOffset]);

  // Generate mock price for a depart+return pair
  function getPrice(dep: Date, ret: Date): number | null {
    if (ret <= dep) return null;
    const departDay = dep.getDate();
    const returnDay = ret.getDate();
    const monthFactor = dep.getMonth() + ret.getMonth();
    return (
      (((departDay * 17 + returnDay * 13 + monthFactor * 7) % 400) + 200) * 83
    );
  }

  // Compute all prices for color coding
  const allPrices: number[] = [];
  for (const dep of departRows) {
    for (const ret of returnCols) {
      const p = getPrice(dep, ret);
      if (p !== null) allPrices.push(p);
    }
  }
  const minPrice = allPrices.length ? Math.min(...allPrices) : 0;
  const maxPrice = allPrices.length ? Math.max(...allPrices) : 0;

  // Per-row cheapest for "Best deal" badge
  const rowMinPrices = departRows.map((dep) => {
    const prices = returnCols
      .map((ret) => getPrice(dep, ret))
      .filter((p): p is number => p !== null);
    return prices.length ? Math.min(...prices) : null;
  });

  return (
    <div className="bg-white rounded-2xl border border-border mb-6 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gray-50">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-gray-700">
            Fare Matrix — Round Trip
          </span>
        </div>
        <button
          type="button"
          className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
          onClick={() => setReturnOffset((o) => o - 1)}
          data-ocid="matrix.pagination_prev"
        >
          ← −7 Day
        </button>
        <button
          type="button"
          className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
          onClick={() => setReturnOffset((o) => o + 1)}
          data-ocid="matrix.pagination_next"
        >
          +7 Day →
        </button>
      </div>

      {/* Scrollable table */}
      <div className="overflow-x-auto">
        <table className="border-collapse w-full min-w-max text-sm">
          <thead>
            <tr>
              {/* Top-left corner: Departure label */}
              <th className="w-[130px] min-w-[130px] bg-gray-50 border border-gray-200 px-2 py-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Departure ↓ / Return →
                </span>
              </th>
              {returnCols.map((ret) => (
                <th
                  key={ret.toISOString()}
                  className="bg-gray-50 border border-gray-200 px-2 py-2 text-center min-w-[100px]"
                >
                  <div className="text-[9px] text-gray-400 font-medium uppercase tracking-wide mb-0.5">
                    Return
                  </div>
                  <div className="text-base font-bold text-gray-800 leading-none">
                    {format(ret, "d")}
                  </div>
                  <div className="text-[10px] font-semibold text-gray-600">
                    {format(ret, "EEE")}
                  </div>
                  <div className="text-[9px] text-gray-400">
                    {format(ret, "MMM yyyy")}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {departRows.map((dep, rowIdx) => (
              <tr key={dep.toISOString()}>
                {/* Row label */}
                <td className="bg-white border border-gray-200 px-2 py-2 text-left">
                  <div className="text-[9px] text-gray-400 font-medium uppercase tracking-wide mb-0.5">
                    Departure
                  </div>
                  <div className="text-base font-bold text-gray-800 leading-none">
                    {format(dep, "d")}
                  </div>
                  <div className="text-[10px] font-semibold text-gray-600">
                    {format(dep, "EEE")}
                  </div>
                  <div className="text-[9px] text-gray-400">
                    {format(dep, "MMM yyyy")}
                  </div>
                </td>
                {returnCols.map((ret) => {
                  const price = getPrice(dep, ret);
                  const isSelectedPair =
                    dep.toDateString() === departDate.toDateString() &&
                    ret.toDateString() === returnDate.toDateString();
                  const isCheapestOverall =
                    price !== null && price === minPrice;
                  const isCostliestOverall =
                    price !== null && price === maxPrice;
                  const isRowBestDeal =
                    price !== null && price === rowMinPrices[rowIdx];

                  let cellBg = "bg-white hover:bg-blue-50";
                  let textColor = "text-gray-800";
                  if (isSelectedPair) {
                    cellBg = "bg-[#1a6bcc]";
                    textColor = "text-white";
                  } else if (isCheapestOverall) {
                    cellBg = "bg-green-50 hover:bg-green-100";
                    textColor = "text-green-700";
                  } else if (isCostliestOverall) {
                    cellBg = "bg-white hover:bg-red-50";
                    textColor = "text-red-600";
                  }

                  return (
                    <td
                      key={ret.toISOString()}
                      className={`border border-gray-200 text-center relative cursor-pointer transition-colors ${cellBg}`}
                      style={{
                        width: "100px",
                        height: "72px",
                        verticalAlign: "middle",
                      }}
                      onClick={() => {
                        if (price !== null) {
                          onSelectDepartDate(dep);
                          onSelectReturnDate(ret);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (
                          (e.key === "Enter" || e.key === " ") &&
                          price !== null
                        ) {
                          onSelectDepartDate(dep);
                          onSelectReturnDate(ret);
                        }
                      }}
                      tabIndex={price !== null ? 0 : -1}
                      data-ocid="matrix.canvas_target"
                    >
                      {price === null ? (
                        <span className="text-gray-300 text-lg select-none">
                          —
                        </span>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full px-1 py-1">
                          {isRowBestDeal && !isSelectedPair && (
                            <span className="absolute top-1 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap leading-none">
                              Best deal
                            </span>
                          )}
                          <div
                            className={`text-[9px] font-medium mt-3 ${isSelectedPair ? "text-blue-200" : "text-gray-400"}`}
                          >
                            INR
                          </div>
                          <div
                            className={`text-[11px] font-bold leading-tight ${textColor}`}
                          >
                            {(price / 83).toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                            })}
                          </div>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer nav + legend */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-gray-50">
        <button
          type="button"
          className="text-xs text-primary font-medium hover:underline"
          onClick={() => setDepartOffset((o) => o - 1)}
          data-ocid="matrix.pagination_prev"
        >
          ↑ −7 Day
        </button>
        <div className="flex items-center gap-4 text-[10px] text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-[#1a6bcc] inline-block" />{" "}
            Selected dates
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-green-100 border border-green-400 inline-block" />{" "}
            Cheapest
          </span>
          <span className="flex items-center gap-1 text-red-500">
            <span className="w-3 h-3 rounded bg-red-100 border border-red-400 inline-block" />{" "}
            Costliest
          </span>
          <span>— No flight available</span>
        </div>
        <button
          type="button"
          className="text-xs text-primary font-medium hover:underline"
          onClick={() => setDepartOffset((o) => o + 1)}
          data-ocid="matrix.pagination_next"
        >
          ↓ +7 Day
        </button>
      </div>
      <div className="text-center text-[10px] text-gray-400 pb-2">
        Best round trip fares per adult.
      </div>
    </div>
  );
}

// ---- Flight Card ----
function FlightCard({ flight, rank }: { flight: Flight; rank: number }) {
  const [showAll, setShowAll] = useState(false);

  const sortedSites = useMemo(() => {
    return [...BOOKING_SITES].sort(
      (a, b) => (flight.sitePrices[a.id] ?? 0) - (flight.sitePrices[b.id] ?? 0),
    );
  }, [flight.sitePrices]);

  const cheapestSite = sortedSites[0];
  const costliestSite = sortedSites[sortedSites.length - 1];
  const cheapestPrice = flight.sitePrices[cheapestSite.id];

  const visibleSites = showAll ? sortedSites : sortedSites.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.05 }}
      className={`bg-white rounded-2xl border-2 ${
        rank === 0
          ? "border-primary shadow-md"
          : "border-border hover:border-primary/40"
      } transition-colors overflow-hidden`}
    >
      {/* Top section */}
      <div className="p-5">
        {/* Best price badge at top */}
        {rank === 0 && (
          <div className="mb-3">
            <Badge className="bg-primary text-primary-foreground text-xs">
              🏆 Best Price Overall
            </Badge>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Airline info */}
          <div className="flex items-center gap-3 min-w-[160px]">
            <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-xl">
              {flight.logo}
            </div>
            <div>
              <div className="font-semibold text-sm">{flight.airline}</div>
              <div className="text-xs text-muted-foreground font-mono">
                {flight.flightNumber}
              </div>
            </div>
          </div>

          {/* Flight times */}
          <div className="flex-1 flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold tabular-nums">
                {flight.departureTime}
              </div>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> {flight.duration}
              </div>
              <div className="w-full flex items-center gap-1">
                <div className="flex-1 h-px bg-border" />
                <Plane className="h-3 w-3 text-primary rotate-90" />
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="text-xs text-muted-foreground">
                {flight.stops === 0 ? (
                  <span className="text-green-600 font-medium">Nonstop</span>
                ) : (
                  <span className="text-orange-500 font-medium">
                    1 stop · {flight.stopCity}
                  </span>
                )}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold tabular-nums">
                {flight.arrivalTime}
              </div>
            </div>
          </div>

          {/* Cheapest badge */}
          <div className="flex flex-col items-end gap-1 min-w-[140px]">
            <div className="text-xs text-muted-foreground">Cheapest on</div>
            <div
              className="text-sm font-bold"
              style={{ color: cheapestSite.color }}
            >
              {cheapestSite.emoji} {cheapestSite.name}
            </div>
            <div className="text-2xl font-bold text-green-600">
              {formatINR(cheapestPrice)}
            </div>
            <div className="text-xs text-muted-foreground">per person</div>
          </div>
        </div>
      </div>

      {/* Site prices section */}
      <div className="border-t border-border bg-slate-50/50">
        <div className="px-5 py-3">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Compare Prices Across Booking Sites
          </div>
          <div className="space-y-1.5">
            {visibleSites.map((site) => {
              const price = flight.sitePrices[site.id] ?? 0;
              const isCheapest = site.id === cheapestSite.id;
              const isCostliest = site.id === costliestSite.id;

              let rowClass = "flex items-center gap-3 rounded-lg px-3 py-2 ";
              if (isCheapest)
                rowClass += "bg-green-50 border border-green-200 ";
              else if (isCostliest)
                rowClass += "bg-red-50 border border-red-100 ";
              else rowClass += "bg-white border border-transparent ";

              return (
                <div key={site.id} className={rowClass}>
                  <span className="text-base w-6 text-center">
                    {site.emoji}
                  </span>
                  <span
                    className="text-sm font-semibold min-w-[100px]"
                    style={{ color: site.color }}
                  >
                    {site.name}
                  </span>
                  {isCheapest && (
                    <Badge className="bg-green-500 text-white text-[10px] px-1.5 py-0 h-4">
                      BEST DEAL
                    </Badge>
                  )}
                  <div className="flex-1" />
                  <span
                    className={`text-sm font-bold ${
                      isCheapest
                        ? "text-green-700"
                        : isCostliest
                          ? "text-red-600"
                          : "text-foreground"
                    }`}
                  >
                    {formatINR(price)}
                  </span>
                  <Button
                    size="sm"
                    variant={isCheapest ? "default" : "outline"}
                    className="h-7 text-xs px-3"
                    data-ocid={"flight.book.button"}
                    onClick={() => window.open(site.url, "_blank")}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    {isCheapest ? "Book - Cheapest" : "Book"}
                  </Button>
                </div>
              );
            })}
          </div>

          {sortedSites.length > 3 && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              data-ocid="flight.show_all.toggle"
              className="mt-2 w-full flex items-center justify-center gap-1 text-xs text-primary font-medium py-1.5 rounded-lg hover:bg-primary/5 transition-colors"
            >
              {showAll ? (
                <>
                  <ChevronUp className="h-3 w-3" /> Show fewer sites
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3" /> Show all{" "}
                  {sortedSites.length} sites
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ---- Airport Combobox ----
function AirportCombobox({
  value,
  onChange,
  placeholder,
}: {
  value: Airport | null;
  onChange: (a: Airport) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return airports.slice(0, 80);
    const q = search.toLowerCase();
    return airports
      .filter(
        (a) =>
          a.iata.toLowerCase().includes(q) ||
          a.city.toLowerCase().includes(q) ||
          a.country.toLowerCase().includes(q) ||
          a.name.toLowerCase().includes(q),
      )
      .slice(0, 100);
  }, [search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-ocid="airport.select"
          className="w-full flex items-center gap-2 px-4 py-3 bg-white border-2 border-border rounded-xl text-left hover:border-primary transition-colors min-h-[56px] group"
        >
          <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
          {value ? (
            <div className="flex-1 min-w-0">
              <div className="font-bold text-foreground text-sm">
                {value.iata}{" "}
                <span className="font-normal text-muted-foreground">
                  — {value.city}, {value.country}
                </span>
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {value.name}
              </div>
            </div>
          ) : (
            <span className="text-muted-foreground text-sm">{placeholder}</span>
          )}
          <ChevronDown className="h-4 w-4 text-muted-foreground ml-auto shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search by city, airport or IATA code..."
            value={search}
            onValueChange={setSearch}
            className="h-11"
          />
          <CommandList className="max-h-[320px]">
            <CommandEmpty>No airports found.</CommandEmpty>
            <CommandGroup
              heading={
                search ? `Results (${filtered.length})` : "Popular airports"
              }
            >
              {filtered.map((a) => (
                <CommandItem
                  key={`${a.iata}-${a.city}`}
                  value={a.iata}
                  onSelect={() => {
                    onChange(a);
                    setSearch("");
                    setOpen(false);
                  }}
                  className="flex items-center gap-3 py-2"
                >
                  <span className="font-mono font-bold text-primary w-10 shrink-0">
                    {a.iata}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {a.city}, {a.country}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {a.name}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">
                    T{a.tier}
                  </Badge>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ---- Date Picker ----
function DatePicker({
  date,
  onSelect,
  placeholder,
  minDate,
}: {
  date: Date | undefined;
  onSelect: (d: Date | undefined) => void;
  placeholder: string;
  minDate?: Date;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-ocid="date.select"
          className="w-full flex items-center gap-2 px-4 py-3 bg-white border-2 border-border rounded-xl text-left hover:border-primary transition-colors min-h-[56px]"
        >
          <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
          {date ? (
            <div>
              <div className="font-semibold text-sm text-foreground">
                {format(date, "EEE, MMM d")}
              </div>
              <div className="text-xs text-muted-foreground">
                {format(date, "yyyy")}
              </div>
            </div>
          ) : (
            <span className="text-muted-foreground text-sm">{placeholder}</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            onSelect(d);
            setOpen(false);
          }}
          disabled={(d) => {
            const min = minDate ?? new Date();
            min.setHours(0, 0, 0, 0);
            return d < min;
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

// ---- Popular Destination Card ----
function PopularDestCard({
  dest,
  onClick,
}: {
  dest: (typeof POPULAR_DESTINATIONS)[0];
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="bg-white rounded-2xl border-2 border-border hover:border-primary/60 hover:shadow-md transition-all p-4 text-left w-full"
    >
      <div className="text-3xl mb-2">{dest.emoji}</div>
      <div className="font-bold text-sm text-foreground">{dest.city}</div>
      <div className="text-xs text-muted-foreground mb-2">{dest.country}</div>
      <div className="text-primary font-bold text-sm">
        from {formatINR(dest.price)}
      </div>
    </motion.button>
  );
}

// ---- Main App ----
export default function App() {
  const [tripType, setTripType] = useState<"one-way" | "round-trip">(
    "round-trip",
  );
  const [origin, setOrigin] = useState<Airport | null>(null);
  const [destination, setDestination] = useState<Airport | null>(null);
  const [departDate, setDepartDate] = useState<Date | undefined>(
    addDays(new Date(), 14),
  );
  const [returnDate, setReturnDate] = useState<Date | undefined>(
    addDays(new Date(), 21),
  );
  const [passengers, setPassengers] = useState(1);
  const [cabin, setCabin] = useState("Economy");
  const [flights, setFlights] = useState<Flight[]>([]);
  const [searched, setSearched] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [stopsFilter, setStopsFilter] = useState<"all" | "nonstop" | "1stop">(
    "all",
  );
  const [showFilters, setShowFilters] = useState(false);
  const [airlineFilter, setAirlineFilter] = useState<string[]>([]);
  const [departTimeFilter, setDepartTimeFilter] = useState<string[]>([]);
  const [arrivalTimeFilter, setArrivalTimeFilter] = useState<string[]>([]);
  const [durationMax, setDurationMax] = useState<number>(24);
  const [sortBy, setSortBy] = useState<
    "cheapest" | "fastest" | "earliest" | "latest"
  >("cheapest");

  function handleSwap() {
    setOrigin(destination);
    setDestination(origin);
  }

  function handleSearch() {
    if (!origin || !destination) return;
    const result = generateFlights(origin, destination);
    setFlights(result);
    const prices = result.map((f) => f.basePrice);
    setPriceRange([0, Math.max(...prices) + 5000]);
    setAirlineFilter([]);
    setDepartTimeFilter([]);
    setArrivalTimeFilter([]);
    setDurationMax(24);
    setSortBy("cheapest");
    setSearched(true);
    setShowFilters(true);
  }

  function toggleFilter<T>(arr: T[], val: T, set: (v: T[]) => void) {
    set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  }

  const airlinesInResults = useMemo(() => {
    const map = new Map<string, number>();
    for (const f of flights) {
      map.set(f.airline, (map.get(f.airline) ?? 0) + 1);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [flights]);

  const filteredFlights = useMemo(() => {
    let list = flights.filter((f) => {
      if (f.basePrice < priceRange[0] || f.basePrice > priceRange[1])
        return false;
      if (stopsFilter === "nonstop" && f.stops !== 0) return false;
      if (stopsFilter === "1stop" && f.stops !== 1) return false;
      if (airlineFilter.length > 0 && !airlineFilter.includes(f.airline))
        return false;
      if (
        departTimeFilter.length > 0 &&
        !departTimeFilter.includes(getTimeSlot(f.departureTime))
      )
        return false;
      if (
        arrivalTimeFilter.length > 0 &&
        !arrivalTimeFilter.includes(getTimeSlot(f.arrivalTime))
      )
        return false;
      if (parseDurationHours(f.duration) > durationMax) return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sortBy === "cheapest") return a.basePrice - b.basePrice;
      if (sortBy === "fastest")
        return parseDurationHours(a.duration) - parseDurationHours(b.duration);
      if (sortBy === "earliest")
        return a.departureTime.localeCompare(b.departureTime);
      if (sortBy === "latest")
        return b.arrivalTime.localeCompare(a.arrivalTime);
      return 0;
    });

    return list;
  }, [
    flights,
    priceRange,
    stopsFilter,
    airlineFilter,
    departTimeFilter,
    arrivalTimeFilter,
    durationMax,
    sortBy,
  ]);

  const canSearch = !!origin && !!destination && !!departDate;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-background to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
              <Plane className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <div className="font-bold text-lg leading-tight text-foreground">
                Flight Price Fixer
              </div>
              <div className="text-xs text-muted-foreground">
                Compare 8 booking sites instantly
              </div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 flex-wrap">
            {BOOKING_SITES.slice(0, 5).map((s) => (
              <span
                key={s.id}
                className="text-xs font-medium px-2 py-1 rounded-full bg-secondary text-secondary-foreground"
              >
                {s.emoji} {s.name}
              </span>
            ))}
            <span className="text-xs text-muted-foreground">
              +{BOOKING_SITES.length - 5} more
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero + Search Form */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-lg border border-border p-6 mb-8"
        >
          {/* Trip type */}
          <div className="flex gap-2 mb-5">
            {(["one-way", "round-trip"] as const).map((t) => (
              <button
                type="button"
                key={t}
                data-ocid={`search.${t.replace("-", "_")}.toggle`}
                onClick={() => setTripType(t)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  tripType === t
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-primary/10"
                }`}
              >
                {t === "one-way" ? "One Way" : "Round Trip"}
              </button>
            ))}
          </div>

          {/* Origin / Destination row */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 mb-4 items-center">
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                From
              </div>
              <AirportCombobox
                value={origin}
                onChange={setOrigin}
                placeholder="Origin city or airport"
              />
            </div>
            <button
              type="button"
              onClick={handleSwap}
              data-ocid="search.swap_button"
              className="mt-5 w-10 h-10 mx-auto flex items-center justify-center rounded-full border-2 border-border hover:border-primary hover:bg-primary/5 transition-colors"
              title="Swap airports"
            >
              <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
            </button>
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                To
              </div>
              <AirportCombobox
                value={destination}
                onChange={setDestination}
                placeholder="Destination city or airport"
              />
            </div>
          </div>

          {/* Dates row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                Departure
              </div>
              <DatePicker
                date={departDate}
                onSelect={setDepartDate}
                placeholder="Departure date"
                minDate={new Date()}
              />
            </div>
            {tripType === "round-trip" && (
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                  Return
                </div>
                <DatePicker
                  date={returnDate}
                  onSelect={setReturnDate}
                  placeholder="Return date"
                  minDate={departDate ?? new Date()}
                />
              </div>
            )}
            {/* Passengers */}
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                Passengers
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    data-ocid="search.passengers.select"
                    className="w-full flex items-center gap-2 px-4 py-3 bg-white border-2 border-border rounded-xl text-left hover:border-primary transition-colors min-h-[56px]"
                  >
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {passengers} Passenger{passengers > 1 ? "s" : ""}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-4">
                  <div className="font-semibold mb-3 text-sm">Passengers</div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setPassengers(Math.max(1, passengers - 1))}
                      disabled={passengers <= 1}
                    >
                      –
                    </Button>
                    <span className="text-lg font-bold w-6 text-center">
                      {passengers}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setPassengers(Math.min(9, passengers + 1))}
                      disabled={passengers >= 9}
                    >
                      +
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            {/* Cabin */}
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                Cabin
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    data-ocid="search.cabin.select"
                    className="w-full flex items-center gap-2 px-4 py-3 bg-white border-2 border-border rounded-xl text-left hover:border-primary transition-colors min-h-[56px]"
                  >
                    <Star className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{cabin}</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground ml-auto" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2">
                  {["Economy", "Premium Economy", "Business", "First"].map(
                    (c) => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setCabin(c)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-secondary transition-colors ${
                          cabin === c ? "font-semibold text-primary" : ""
                        }`}
                      >
                        {c}
                      </button>
                    ),
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Search button */}
          <Button
            size="lg"
            className="w-full h-14 text-base font-bold rounded-2xl gap-2"
            onClick={handleSearch}
            disabled={!canSearch}
            data-ocid="search.submit_button"
          >
            <Search className="h-5 w-5" />
            Search &amp; Compare All Sites
          </Button>
          {!canSearch && (
            <p className="text-center text-sm text-muted-foreground mt-2">
              Please select origin, destination and departure date.
            </p>
          )}
        </motion.div>

        {/* Popular Destinations (shown before search) */}
        {!searched && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-10"
          >
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground">
                Popular Destinations
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {POPULAR_DESTINATIONS.map((dest) => (
                <PopularDestCard
                  key={dest.iata}
                  dest={dest}
                  onClick={() => {
                    const airport = airports.find((a) => a.iata === dest.iata);
                    if (airport) setDestination(airport);
                  }}
                />
              ))}
            </div>
          </motion.section>
        )}

        {/* Results */}
        <AnimatePresence>
          {searched && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Results header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold">
                    {origin?.iata} → {destination?.iata}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {departDate && format(departDate, "EEE, MMM d, yyyy")} ·{" "}
                    {passengers} passenger{passengers > 1 ? "s" : ""} · {cabin}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters((v) => !v)}
                  data-ocid="results.filter.toggle"
                  className="gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  {showFilters ? <X className="h-3 w-3" /> : null}
                </Button>
              </div>

              {/* Date Matrix */}
              {departDate && returnDate && (
                <DateMatrix
                  departDate={departDate}
                  returnDate={returnDate}
                  onSelectDepartDate={(d) => setDepartDate(d)}
                  onSelectReturnDate={(d) => setReturnDate(d)}
                />
              )}

              {/* Sort tabs */}
              <div
                className="flex gap-2 mb-5 flex-wrap"
                data-ocid="results.sort.tab"
              >
                {(
                  [
                    { id: "cheapest", label: "Cheapest", icon: "💰" },
                    { id: "fastest", label: "Fastest", icon: "⚡" },
                    { id: "earliest", label: "Earliest", icon: "🌅" },
                    { id: "latest", label: "Latest Arrival", icon: "🌙" },
                  ] as const
                ).map((s) => (
                  <button
                    type="button"
                    key={s.id}
                    data-ocid={`results.sort.${s.id}.toggle`}
                    onClick={() => setSortBy(s.id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${
                      sortBy === s.id
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-white border-border hover:border-primary/40"
                    }`}
                  >
                    <span>{s.icon}</span>
                    {s.label}
                    {sortBy === s.id && <Zap className="h-3 w-3" />}
                  </button>
                ))}
              </div>

              <div className="flex gap-6">
                {/* Filter panel */}
                <AnimatePresence>
                  {showFilters && (
                    <motion.aside
                      initial={{ opacity: 0, x: -20, width: 0 }}
                      animate={{ opacity: 1, x: 0, width: 260 }}
                      exit={{ opacity: 0, x: -20, width: 0 }}
                      className="shrink-0"
                      data-ocid="results.filter.panel"
                    >
                      <div className="bg-white rounded-2xl border border-border p-5 space-y-6 sticky top-24">
                        {/* Price Range */}
                        <div>
                          <div className="font-semibold text-sm mb-3">
                            Price Range
                          </div>
                          <Slider
                            min={0}
                            max={
                              Math.max(...flights.map((f) => f.basePrice)) +
                              5000
                            }
                            step={500}
                            value={priceRange}
                            onValueChange={setPriceRange}
                          />
                          <div className="flex justify-between text-xs text-muted-foreground mt-2">
                            <span>{formatINR(priceRange[0])}</span>
                            <span>{formatINR(priceRange[1])}</span>
                          </div>
                        </div>

                        {/* Stops */}
                        <div>
                          <div className="font-semibold text-sm mb-3">
                            Stops
                          </div>
                          {(["all", "nonstop", "1stop"] as const).map((s) => (
                            <button
                              type="button"
                              key={s}
                              data-ocid={`filter.stops.${s}`}
                              onClick={() => setStopsFilter(s)}
                              className={`block w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-colors ${
                                stopsFilter === s
                                  ? "bg-primary/10 text-primary font-semibold"
                                  : "hover:bg-secondary"
                              }`}
                            >
                              {s === "all"
                                ? "All flights"
                                : s === "nonstop"
                                  ? "Nonstop only"
                                  : "1 stop"}
                            </button>
                          ))}
                        </div>

                        {/* Departure Time */}
                        <div>
                          <div className="font-semibold text-sm mb-3">
                            Departure Time
                          </div>
                          {TIME_SLOTS.map((slot) => {
                            const Icon = slot.icon;
                            return (
                              <label
                                key={slot.id}
                                htmlFor={`depart-${slot.id}`}
                                className="flex items-center gap-3 py-2 cursor-pointer hover:bg-secondary/50 rounded-lg px-2 -mx-2"
                              >
                                <Checkbox
                                  id={`depart-${slot.id}`}
                                  checked={departTimeFilter.includes(slot.id)}
                                  onCheckedChange={() =>
                                    toggleFilter(
                                      departTimeFilter,
                                      slot.id,
                                      setDepartTimeFilter,
                                    )
                                  }
                                  data-ocid={`filter.depart_time.${slot.id}.checkbox`}
                                />
                                <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium">
                                    {slot.label}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {slot.sub}
                                  </div>
                                </div>
                              </label>
                            );
                          })}
                        </div>

                        {/* Arrival Time */}
                        <div>
                          <div className="font-semibold text-sm mb-3">
                            Arrival Time
                          </div>
                          {TIME_SLOTS.map((slot) => {
                            const Icon = slot.icon;
                            return (
                              <label
                                key={slot.id}
                                htmlFor={`arrival-${slot.id}`}
                                className="flex items-center gap-3 py-2 cursor-pointer hover:bg-secondary/50 rounded-lg px-2 -mx-2"
                              >
                                <Checkbox
                                  id={`arrival-${slot.id}`}
                                  checked={arrivalTimeFilter.includes(slot.id)}
                                  onCheckedChange={() =>
                                    toggleFilter(
                                      arrivalTimeFilter,
                                      slot.id,
                                      setArrivalTimeFilter,
                                    )
                                  }
                                  data-ocid={`filter.arrival_time.${slot.id}.checkbox`}
                                />
                                <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium">
                                    {slot.label}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {slot.sub}
                                  </div>
                                </div>
                              </label>
                            );
                          })}
                        </div>

                        {/* Max Duration */}
                        <div>
                          <div className="font-semibold text-sm mb-1">
                            Max Duration
                          </div>
                          <div className="text-xs text-muted-foreground mb-3">
                            Up to{" "}
                            {durationMax === 24 ? "Any" : `${durationMax}h`}
                          </div>
                          <Slider
                            min={2}
                            max={24}
                            step={1}
                            value={[durationMax]}
                            onValueChange={([v]) => setDurationMax(v ?? 24)}
                          />
                          <div className="flex justify-between text-xs text-muted-foreground mt-2">
                            <span>2h</span>
                            <span>24h+</span>
                          </div>
                        </div>

                        {/* Airlines */}
                        {airlinesInResults.length > 0 && (
                          <div>
                            <div className="font-semibold text-sm mb-3">
                              Airlines
                            </div>
                            {airlinesInResults.map(([airline, count]) => (
                              <label
                                key={airline}
                                htmlFor={`airline-${airline}`}
                                className="flex items-center gap-3 py-2 cursor-pointer hover:bg-secondary/50 rounded-lg px-2 -mx-2"
                              >
                                <Checkbox
                                  id={`airline-${airline}`}
                                  checked={airlineFilter.includes(airline)}
                                  onCheckedChange={() =>
                                    toggleFilter(
                                      airlineFilter,
                                      airline,
                                      setAirlineFilter,
                                    )
                                  }
                                  data-ocid="filter.airline.checkbox"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm truncate">
                                    {airline}
                                  </div>
                                </div>
                                <span className="text-xs text-muted-foreground shrink-0">
                                  {count}
                                </span>
                              </label>
                            ))}
                          </div>
                        )}

                        {/* Reset filters */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          data-ocid="filter.reset.button"
                          onClick={() => {
                            setAirlineFilter([]);
                            setDepartTimeFilter([]);
                            setArrivalTimeFilter([]);
                            setDurationMax(24);
                            setStopsFilter("all");
                            const prices = flights.map((f) => f.basePrice);
                            setPriceRange([0, Math.max(...prices) + 5000]);
                          }}
                        >
                          Reset Filters
                        </Button>
                      </div>
                    </motion.aside>
                  )}
                </AnimatePresence>

                {/* Flight list */}
                <div className="flex-1 space-y-4">
                  {filteredFlights.length === 0 ? (
                    <div
                      className="bg-white rounded-2xl border border-border p-12 text-center text-muted-foreground"
                      data-ocid="results.empty_state"
                    >
                      No flights match your filters.
                    </div>
                  ) : (
                    filteredFlights.map((flight, idx) => (
                      <div
                        key={flight.id}
                        className="relative"
                        data-ocid={`results.item.${idx + 1}`}
                      >
                        <FlightCard flight={flight} rank={idx} />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-border py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
