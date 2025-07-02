<template>
  <div class="page-wrapper">
    <div class="container">
      <h1 class="page-title">Transaction Dashboard</h1>
      <!-- Top Buttons -->
      <div class="button-group">
        <button @click="setType('deposits')" :class="{ active: type === 'deposits' }">Deposits</button>
        <button @click="setType('withdrawals')" :class="{ active: type === 'withdrawals' }">Withdrawals</button>
        <button @click="setType('combined')" :class="{ active: type === 'combined' }">Combined</button>
      </div>

      <!-- Filters -->
      <div class="filters">
        <div class="filter-group">
          <label>Start&nbsp;Date:</label>
          <input type="date" v-model="filters.startDate" />
        </div>
        <div class="filter-group">
          <label>End&nbsp;Date:</label>
          <input type="date" v-model="filters.endDate" />
        </div>
        <div class="filter-group">
          <label>Paybill:</label>
          <select v-model="filters.paybill">
            <option value="">All</option>
            <option v-for="pb in uniquePaybills" :key="pb" :value="pb">{{ pb }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Search&nbsp;By:</label>
          <select v-model="filters.searchField">
            <option value="">None</option>
            <option value="mobile">Mobile</option>
            <option value="amount">Amount</option>
            <option value="paybill">Paybill</option>
            <option value="time">Time</option>
          </select>
        </div>
        <div class="filter-group flex-1">
          <label>Search:</label>
          <input type="text" v-model="filters.searchText" placeholder="Start typing…" />
        </div>
      </div>

      <!-- Totals -->
      <div class="totals" v-if="type !== 'combined'">
        <span>Total&nbsp;Amount: <strong>{{ fmtMoney(totalSingle) }}</strong></span>
        <span class="ml">Count: <strong>{{ countSingle }}</strong></span>
      </div>
      <div class="totals" v-else>
        <span>Deposits: <strong>{{ fmtMoney(totalDeposits) }}</strong></span>
        <span class="ml">Withdrawals: <strong>{{ fmtMoney(totalWithdrawals) }}</strong></span>
        <span class="ml">
  Net&nbsp;Cash:
  <strong :class="{ positive: totalNetCash >= 0, negative: totalNetCash < 0 }">
    {{ fmtMoney(totalNetCash) }}
  </strong>
</span>
      </div>

      <!-- Table wrapper -->
      <div class="table-wrapper">
        <table v-if="type !== 'combined'" class="jstable">
          <thead>
            <tr>
              <th>Mobile</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Time</th>
              <th>Paybill</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in paginatedRows" :key="row.id">
              <td>{{ row.mobile }}</td>
              <td>{{ fmtMoney(row.amount) }}</td>
              <td>{{ fmtDisplay(row.date) }}</td>
              <td>{{ fmtTime(row.created_at) }}</td>
              <td>{{ row.paybill }}</td>
            </tr>
          </tbody>
        </table>

        <table v-else class="jstable">
          <thead>
            <tr>
              <th>Date</th>
              <th>Deposits</th>
              <th>Withdrawals</th>
              <th>Net&nbsp;Cash</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="day in paginatedAggregatedRows" :key="day.date">
              <td>{{ fmtDisplay(day.date) }}</td>
              <td>{{ fmtMoney(day.deposits) }}</td>
              <td>{{ fmtMoney(day.withdrawals) }}</td>
              <td :class="{ positive: day.netCash >= 0, negative: day.netCash < 0 }">
                {{ fmtMoney(day.netCash) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination">
        <button @click="prevPage" :disabled="page === 1">Prev</button>
        <span>Page&nbsp;{{ page }}&nbsp;of&nbsp;{{ type === 'combined' ? totalPagesAggregated : totalPagesSingle }}</span>
        <button @click="nextPage" :disabled="page === (type === 'combined' ? totalPagesAggregated : totalPagesSingle)">
          Next
        </button> 
      </div>
      <div style="text-align: right; margin-bottom: 16px;">
  <button @click="logout" class="logout-button">Logout</button>
</div> 
    </div>
  </div>
  
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const API_BASE = '/api/transactions';
const router = useRouter()
const auth = useAuthStore()
const type = ref('combined');
const page = ref(1);
const pageSize = 20;

const today = new Date();
const thirty = new Date(today);
thirty.setDate(today.getDate() - 30);
const iso = (d) => d.toISOString().slice(0, 10);

const filters = ref({
  startDate: iso(thirty),
  endDate: iso(today),
  paybill: '',
  searchField: '',
  searchText: '',
});

const rows = ref([]);

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
  rows.value = Array.isArray(data) ? data : data.rows || [];
}
onMounted(fetchRows);
watch(filters, fetchRows, { deep: true });
watch(type, () => (page.value = 1));

function fmtDisplay(isoStr) {
  const [y, m, d] = isoStr.split('T')[0].split('-');
  return `${d.padStart(2, '0')}-${m.padStart(2, '0')}-${y}`;
}
function fmtTime(isoStr) {
  const t = new Date(isoStr).toTimeString().split(' ')[0];
  return t;
}
function fmtMoney(val) {
  return Number(val).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

const uniquePaybills = computed(() =>
  [...new Set(rows.value.map((r) => r.paybill))].sort()
);

const filteredBase = computed(() =>
  rows.value.filter((r) => {
    const rDateOnly = r.date?.split('T')[0];
    const inRange =
      (!filters.value.startDate || rDateOnly >= filters.value.startDate) &&
      (!filters.value.endDate || rDateOnly <= filters.value.endDate);

    const inPay = !filters.value.paybill || r.paybill === filters.value.paybill;

    const fld = filters.value.searchField;
    const txt = filters.value.searchText.toLowerCase().trim();
    const inSearch =
      !fld || !txt
        ? true
        : fld === 'time'
        ? fmtTime(r.created_at).toLowerCase().includes(txt)
        : String(r[fld]).toLowerCase().includes(txt);

    const inType = type.value === 'combined' || r.type === type.value;

    return inRange && inPay && inSearch && inType;
  })
);

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

const aggregatedRows = computed(() => {
  const m = new Map();
  for (const r of filteredBase.value) {
    const dateKey = r.date.split('T')[0];
    if (!m.has(dateKey))
      m.set(dateKey, { date: dateKey, deposits: 0, withdrawals: 0 });
    const o = m.get(dateKey);
    if (r.type === 'deposits') o.deposits += +r.amount;
    if (r.type === 'withdrawals') o.withdrawals += +r.amount;
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
const totalNetCash = computed(() => totalDeposits.value - totalWithdrawals.value);
const totalPagesAggregated = computed(() =>
  Math.ceil(aggregatedRows.value.length / pageSize)
);
const paginatedAggregatedRows = computed(() =>
  aggregatedRows.value.slice((page.value - 1) * pageSize, page.value * pageSize)
);

function setType(t) {
  type.value = t;
  page.value = 1;
}
function prevPage() {
  if (page.value > 1) page.value--;
}
function nextPage() {
  const last =
    type.value === 'combined'
      ? totalPagesAggregated.value
      : totalPagesSingle.value;
  if (page.value < last) page.value++;
}

function logout() {
  auth.logout()
  router.push({ name: 'Login' })
}
</script>

<style scoped>
.page-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  background: #f2f2f2;
  padding: 40px 20px;
  box-sizing: border-box;
}

.container {
  width: 100%;
  max-width: 1000px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.06);
  padding: 32px 24px;
  box-sizing: border-box;
  font-family: 'Segoe UI', sans-serif;
  color: #000;
}

.page-title {
  text-align: center;
  font-size: 30px;
  margin-bottom: 24px;
}

/***************************************************
 * Button Group
 ***************************************************/
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
  color: #000; /* Default button text color */
}
.button-group button:hover {
  background: #dcdcdc;
}
.button-group button.active {
  background: #007bff;
  color: #fff; /* Active button text white */
}

/***************************************************
 * Filters
 ***************************************************/
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
.filter-group label {
  color: #000;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 4px;
}
.filter-group input,
.filter-group select {
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
  color: #000;
}
@media (max-width: 600px) {
  .filter-group {
    min-width: 100%;
  }}

  .logout-button {
  padding: 8px 14px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s ease;
}

.logout-button:hover {
  background-color: #c82333;
}

.jstable {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.jstable th,
.jstable td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: left;
  font-size: 14px;
}

.jstable th {
  background-color: #f8f8f8;
  font-weight: bold;
  color: #333;
  font-size: 15px;
}

.jstable tbody tr:nth-child(even) {
  background-color: #f9f9f9;
}

.jstable tbody tr:hover {
  background-color: #eef;
}
.totals {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 20px;
  margin-bottom: 16px;
  font-size: 18px;
  font-weight: bold;
  color: #000;
  justify-content: center;
  background-color: #f8f8f8;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.totals span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.totals .ml {
  margin-left: 20px;
}
.positive {
  color: green;
}
.negative {
  color: red;
}
/***************************************************
 * Pagination Controls (Styled only for pagination)
 ***************************************************/
 .pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 30px;
}

.pagination button {
  background-color: #007bff;
  color: #fff;
  border: none;
  padding: 10px 20px;
  font-size: 14px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.pagination button:hover {
  background-color: #0056b3;
  transform: scale(1.05);
}

.pagination button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  transform: none;
}

.pagination span {
  font-size: 15px;
  font-weight: bold;
  color: #333;
}

  </style>