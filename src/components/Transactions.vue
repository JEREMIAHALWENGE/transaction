<template>
  <div class="container">
    <h1 class="page-title">Transaction Dashboard</h1>

    <!-- Top Buttons -->
    <div class="button-group">
      <button
        @click="setType('deposits')"
        :class="{ active: type === 'deposits' }"
      >
        Deposits
      </button>
      <button
        @click="setType('withdrawals')"
        :class="{ active: type === 'withdrawals' }"
      >
        Withdrawals
      </button>
      <button
        @click="setType('combined')"
        :class="{ active: type === 'combined' }"
      >
        Combined
      </button>
    </div>

    <!-- Filters -->
    <div class="filters">
      <div class="filter-group">
        <label>Start Date:</label>
        <input type="date" v-model="filters.startDate" />
      </div>
      <div class="filter-group">
        <label>End Date:</label>
        <input type="date" v-model="filters.endDate" />
      </div>
      <div class="filter-group">
        <label>Paybill:</label>
        <select v-model="filters.paybill">
          <option value="">All</option>
          <option v-for="pb in uniquePaybills" :key="pb" :value="pb">
            {{ pb }}
          </option>
        </select>
      </div>
      <div class="filter-group">
        <label>Search By:</label>
        <select v-model="filters.searchField">
          <option value="">None</option>
          <option value="mobile">Mobile</option>
          <option value="amount">Amount</option>
          <option value="paybill">Paybill</option>
        </select>
      </div>
      <div class="filter-group flex-1">
        <label>Search:</label>
        <input
          type="text"
          v-model="filters.searchText"
          placeholder="Start typing…"
        />
      </div>
    </div>

    <!-- Totals -->
    <div class="totals" v-if="type !== 'combined'">
      <span
        >Total Amount: <strong>{{ totalSingle.toLocaleString() }}</strong></span
      >
      <span class="ml"
        >Count: <strong>{{ countSingle }}</strong></span
      >
    </div>
    <div class="totals" v-else>
      <span
        >Deposits: <strong>{{ totalDeposits.toLocaleString() }}</strong></span
      >
      <span class="ml"
        >Withdrawals:
        <strong>{{ totalWithdrawals.toLocaleString() }}</strong></span
      >
      <span class="ml"
        >Net Cash: <strong>{{ totalNetCash.toLocaleString() }}</strong></span
      >
    </div>

    <!-- Table wrapper (scrollable on narrow screens) -->
    <div class="table-wrapper">
      <!-- Single View Table -->
      <table v-if="type !== 'combined'" class="jstable">
        <thead>
          <tr>
            <th>Mobile</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Paybill</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in paginatedRows" :key="row.id">
            <td>{{ row.mobile }}</td>
            <td>{{ row.amount }}</td>
            <td>{{ fmtDisplay(row.date) }}</td>
            <td>{{ row.paybill }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Combined View Table -->
      <table v-else class="jstable">
        <thead>
          <tr>
            <th>Date</th>
            <th>Deposits</th>
            <th>Withdrawals</th>
            <th>Net Cash</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="day in paginatedAggregatedRows" :key="day.date">
            <td>{{ fmtDisplay(day.date) }}</td>
            <td>{{ day.deposits }}</td>
            <td>{{ day.withdrawals }}</td>
            <td
              :class="{ positive: day.netCash >= 0, negative: day.netCash < 0 }"
            >
              {{ day.netCash }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination">
      <button @click="prevPage" :disabled="page === 1">Prev</button>
      <span
        >Page {{ page }} of {{
          type === "combined" ? totalPagesAggregated : totalPagesSingle
        }}</span
      >
      <button
        @click="nextPage"
        :disabled="
          page ===
          (type === 'combined' ? totalPagesAggregated : totalPagesSingle)
        "
      >
        Next
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import axios from "axios";

/* Config */
const API_BASE = "http://localhost:3000/api/transactions";

/* State */
const type = ref("combined");
const page = ref(1);
const pageSize = 20;

const today = new Date();
const thirty = new Date(today);
thirty.setDate(today.getDate() - 30);
const iso = (d) => d.toISOString().slice(0, 10);

const filters = ref({
  startDate: iso(thirty),
  endDate: iso(today),
  paybill: "",
  searchField: "",
  searchText: "",
});

const rows = ref([]);

/* Fetch */
async function fetchRows() {
  const { data } = await axios.get(API_BASE, {
    params: {
      start: filters.value.startDate,
      end: filters.value.endDate,
      paybill: filters.value.paybill || undefined,
      field: filters.value.searchField || undefined,
      q: filters.value.searchText || undefined,
    },
  });
  rows.value = data.rows || data;
}
onMounted(fetchRows);
watch(filters, fetchRows, { deep: true });
watch(type, () => (page.value = 1));

/* Helpers */
function fmtDisplay(isoStr) {
  const [y, m, d] = isoStr.split("T")[0].split("-");
  return `${d.padStart(2, "0")}-${m.padStart(2, "0")}-${y}`;
}

/* Derived */
const uniquePaybills = computed(() =>
  [...new Set(rows.value.map((r) => r.paybill))].sort()
);

const filteredBase = computed(() =>
  rows.value.filter((r) => {
    const inRange =
      (!filters.value.startDate || r.date >= filters.value.startDate) &&
      (!filters.value.endDate || r.date <= filters.value.endDate);
    const inPay = !filters.value.paybill || r.paybill === filters.value.paybill;
    const fld = filters.value.searchField,
      txt = filters.value.searchText.toLowerCase().trim();
    const inSearch = !fld || !txt || String(r[fld]).toLowerCase().includes(txt);
    const inType = type.value === "combined" || r.type === type.value;
    return inRange && inPay && inSearch && inType;
  })
);

/* single */
const totalSingle = computed(() =>
  filteredBase.value.reduce((s, r) => s + +r.amount, 0)
);
const countSingle = computed(() => filteredBase.value.length);
const totalPagesSingle = computed(() =>
  Math.ceil(countSingle.value / pageSize)
);
const paginatedRows = computed(() =>
  filteredBase.value.slice((page.value - 1) * pageSize, page.value * pageSize)
);

/* combined */
const aggregatedRows = computed(() => {
  const m = new Map();
  for (const r of filteredBase.value) {
    if (!m.has(r.date))
      m.set(r.date, { date: r.date, deposits: 0, withdrawals: 0 });
    const o = m.get(r.date);
    if (r.type === "deposits") o.deposits += +r.amount;
    if (r.type === "withdrawals") o.withdrawals += +r.amount;
  }
  return Array.from(m.values()).map((d) => ({
    ...d,
    netCash: d.deposits - d.withdrawals,
  }));
});
const totalDeposits = computed(() =>
  aggregatedRows.value.reduce((s, d) => s + d.deposits, 0)
);
const totalWithdrawals = computed(() =>
  aggregatedRows.value.reduce((s, d) => s + d.withdrawals, 0)
);
const totalNetCash = computed(
  () => totalDeposits.value - totalWithdrawals.value
);
const totalPagesAggregated = computed(() =>
  Math.ceil(aggregatedRows.value.length / pageSize)
);
const paginatedAggregatedRows = computed(() =>
  aggregatedRows.value.slice((page.value - 1) * pageSize, page.value * pageSize)
);

/* pagination */
function setType(t) {
  type.value = t;
  page.value = 1;
}
function prevPage() {
  if (page.value > 1) page.value--;
}
function nextPage() {
  const last =
    type.value === "combined"
      ? totalPagesAggregated.value
      : totalPagesSingle.value;
  if (page.value < last) page.value++;
}
</script>

<style scoped>
/* Layout card */
.container {
  max-width: 1200px;
  margin: auto;
  padding: 32px 24px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.06);
  box-sizing: border-box;
  font-family: "Segoe UI", sans-serif;
}
/* Title & buttons */
.page-title {
  text-align: center;
  font-size: 30px;
  margin-bottom: 24px;
  color: #222;
}
.button-group {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}
.button-group button {
  background: #f0f0f0;
  border: none;
  padding: 8px 22px;
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
  transition: background 0.2s;
}
.button-group button:hover {
  background: #dcdcdc;
}
.button-group button.active {
  background: #007bff;
  color: #fff;
}

/* Filters */
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 24px;
}
.filter-group {
  display: flex;
  flex-direction: column;
  font-size: 14px;
  min-width: 140px;
}
.flex-1 {
  flex: 1;
}
.filter-group input,
.filter-group select {
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
}
@media (max-width: 600px) {
  .filter-group {
    min-width: 100%;
  }
}

/* Totals */
.totals {
  font-size: 18px;
  margin-bottom: 16px;
  font-weight: 500;
}
.totals strong {
  font-size: 20px;
  font-weight: bold;
  color: #000;
}
.ml {
  margin-left: 32px;
}

/* Table */
.table-wrapper {
  overflow-x: auto;
}
.jstable {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
}
.jstable th {
  background: #f8f8f8;
  padding: 12px;
  text-align: left;
  border-bottom: 2px solid #e0e0e0;
  font-size: 14px;
}
.jstable td {
  padding: 10px;
  border-bottom: 1px solid #e0e0e0;
  font-size: 14px;
}
.jstable tr:hover {
  background: #f7f9ff;
}
.jstable tbody tr:nth-child(even) {
  background: #fbfbfb;
}
.jstable td.positive {
  color: #047a22;
  font-weight: bold;
}
.jstable td.negative {
  color: #b01717;
  font-weight: bold;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 24px;
}
.pagination button {
  background: #007bff;
  color: #fff;
  border: none;
  padding: 6px 18px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}
.pagination button:disabled {
  background: #c0c0c0;
  cursor: not-allowed;
}
.pagination span {
  font-size: 14px;
}

/* Responsive tweaks */
@media (max-width: 768px) {
  .page-title {
    font-size: 26px;
  }
  .button-group button {
    padding: 6px 18px;
    font-size: 14px;
  }
  .totals {
    font-size: 16px;
  }
  .totals strong {
    font-size: 18px;
  }
}
@media (max-width: 480px) {
  .container {
    padding: 24px 16px;
  }
  .filters {
    gap: 12px;
  }
  .jstable th,
  .jstable td {
    font-size: 13px;
  }
}
</style>
