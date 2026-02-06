import { useEffect, useState } from "react";
import API from "./api";
import "./index.css";

function App() {

  const [stats, setStats] = useState({ income: 0, expense: 0, balance: 0 });
  const [transactions, setTransactions] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Filters
  const [timeFilter, setTimeFilter] = useState("monthly");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Assets (simple manual)
  const [assets, setAssets] = useState({ cash:0, bank:0, wallet:0 });

  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "",
    type: "expense",
    date: "",
  });

  const fetchDashboard = () => {
    API.get("/transactions").then(res => setTransactions(res.data));
    API.get("/dashboard").then(res => setStats(res.data));
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.amount || !form.category) return alert("Fill all fields");

    API.post("/transactions", { ...form, amount:Number(form.amount) }).then(() => {
      setForm({ title:"",amount:"",category:"",type:"expense",date:"" });
      setShowModal(false);
      fetchDashboard();
    });
  };

  // Spending report (category totals)
  const categoryReport = {};
  transactions.forEach(t=>{
    if(t.type==="expense"){
      categoryReport[t.category]=(categoryReport[t.category]||0)+t.amount;
    }
  });

  const totalAssets = Number(assets.cash)+Number(assets.bank)+Number(assets.wallet);

  return (
    <div className="container">

      <h1>💰 Money Manager Dashboard</h1>

      {/* FILTERS */}
      <div className="section">
        <h3>Filters</h3>
        <div className="filters">
          <select onChange={(e)=>setTimeFilter(e.target.value)}>
            <option>Weekly</option>
            <option>Monthly</option>
            <option>Yearly</option>
          </select>

          <div className="date-group">
            <label>From</label>
            <input type="date" onChange={(e)=>setFromDate(e.target.value)} />
          </div>

          <div className="date-group">
            <label>To</label>
            <input type="date" onChange={(e)=>setToDate(e.target.value)} />
          </div>
        </div>
      </div>

      <button className="add-btn" onClick={()=>setShowModal(true)}>➕ Add Transaction</button>

      {/* SUMMARY */}
      <div className="section">
        <h3>Summary</h3>
        <div className="cards">
          <div className="card income"><h3>Income</h3><p>₹{stats.income}</p></div>
          <div className="card expense"><h3>Expense</h3><p>₹{stats.expense}</p></div>
          <div className="card balance"><h3>Balance</h3><p>₹{stats.balance}</p></div>
        </div>
      </div>

      {/* ASSETS */}
      <div className="section">
        <h3>Asset Management</h3>

        <div className="asset-grid">
          <input placeholder="Cash" type="number" onChange={(e)=>setAssets({...assets,cash:e.target.value})}/>
          <input placeholder="Bank" type="number" onChange={(e)=>setAssets({...assets,bank:e.target.value})}/>
          <input placeholder="Wallet" type="number" onChange={(e)=>setAssets({...assets,wallet:e.target.value})}/>
        </div>

        <h4>Total Assets: ₹{totalAssets}</h4>
      </div>

      {/* SPENDING REPORT */}
      <div className="section">
        <h3>Spending Report (By Category)</h3>

        {Object.keys(categoryReport).length===0 && <p>No expense data</p>}

        {Object.entries(categoryReport).map(([cat,val],i)=>(
          <p key={i}>{cat.toUpperCase()} : ₹{val}</p>
        ))}
      </div>

      {/* TRANSACTIONS */}
      <div className="section">
        <h3>Recent Transactions</h3>

        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Category</th>
              <th>Edit</th>
            </tr>
          </thead>

          <tbody>
            {transactions.map((t,i)=>(
              <tr key={i}>
                <td>{t.title}</td>
                <td>₹{t.amount}</td>
                <td>{t.type}</td>
                <td>{t.category}</td>
                <td><button>Edit (12h)</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal-bg">
          <div className="form-card">

            <h2>Add Transaction</h2>

            <div className="tabs">
              <button onClick={()=>setForm({...form,type:"income"})}>Income</button>
              <button onClick={()=>setForm({...form,type:"expense"})}>Expense</button>
            </div>

            <form onSubmit={handleSubmit}>
              <input name="title" placeholder="Title" value={form.title} onChange={handleChange}/>
              <input name="amount" type="number" placeholder="Amount" value={form.amount} onChange={handleChange}/>

              <select name="category" value={form.category} onChange={handleChange}>
                <option value="">Select Category</option>
                <option value="fuel">Fuel</option>
                <option value="food">Food</option>
                <option value="movie">Movie</option>
                <option value="loan">Loan</option>
                <option value="medical">Medical</option>
                <option value="office">Office</option>
                <option value="personal">Personal</option>
              </select>

              <input name="date" type="date" value={form.date} onChange={handleChange}/>

              <button type="submit">Save</button>
              <button type="button" className="close-btn" onClick={()=>setShowModal(false)}>Close</button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default App;
