import { useEffect, useState } from "react";
import supabase from "./supabase";

import "./style.css";

// Data that never changes (ie, is never recreated so it is opposite to what wee see in React function component rerender)
const CATEGORIES = [
  { name: "technology", color: "#3b82f6" },
  { name: "science", color: "#16a34a" },
  { name: "finance", color: "#ef4444" },
  { name: "society", color: "#eab308" },
  { name: "entertainment", color: "#db2777" },
  { name: "health", color: "#14b8a6" },
  { name: "history", color: "#f97316" },
  { name: "news", color: "#8b5cf6" },
];

const initialFacts = [
  {
    id: 1,
    text: "React is being developed by Meta (formerly facebook)",
    source: "https://opensource.fb.com/",
    category: "technology",
    votesInteresting: 24,
    votesMindblowing: 9,
    votesFalse: 4,
    createdIn: 2021,
  },
  {
    id: 2,
    text: "Millennial dads spend 3 times as much time with their kids than their fathers spent with them. In 1982, 43% of fathers had never changed a diaper. Today, that number is down to 3%",
    source: "https://www.mother.ly/parenting/millennial-dads-spend-more-time-with-their-kids",
    category: "society",
    votesInteresting: 11,
    votesMindblowing: 2,
    votesFalse: 0,
    createdIn: 2019,
  },
  {
    id: 3,
    text: "Lisbon is the capital of Portugal",
    source: "https://en.wikipedia.org/wiki/Lisbon",
    category: "society",
    votesInteresting: 8,
    votesMindblowing: 3,
    votesFalse: 1,
    createdIn: 2015,
  },
];

function App() {
  const [showForm, setShowForm] = useState(false);
  const [facts, setFacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCategory, setCurrentCategory] = useState("all");

  useEffect(
    function () {
      async function getFacts() {
        setIsLoading(true);

        // Build the query
        let query = supabase.from("facts").select("*");

        if (currentCategory !== "all") {
          query = query.eq("category", currentCategory);
        }

        // Run the query
        const { data: facts, error } = await query
          .order("votesinteresting", {
            ascending: false,
          })
          .limit(1000);

        if (!error) setFacts(facts);
        else alert("There was some problem loading the data");
        setIsLoading(false);
      }

      getFacts();
    },
    [currentCategory]
  );

  return (
    <>
      <Header showForm={showForm} setShowForm={setShowForm} />

      {showForm ? <NewfactForm setFacts={setFacts} setShowForm={setShowForm} /> : null}

      <main className="main">
        <CategoryFilter setCurrentCategory={setCurrentCategory} />
        {isLoading ? <Loader /> : <FactList facts={facts} setFacts={setFacts} />}
      </main>
    </>
  );
}

function Loader() {
  return <p className="message">Loading...</p>;
}

function Header({ showForm, setShowForm }) {
  return (
    <header className="header">
      <div className="logo">
        <img src="logo.png" height="68" width="68" alt="Today I Learned Logo" />
        <h1>Today I Learned</h1>
      </div>

      <button className="btn btn-large btn-open" onClick={() => setShowForm((currShowstate) => !currShowstate)}>
        {showForm ? "Close" : "Share a fact"}
      </button>
    </header>
  );
}

function CategoryFilter({ setCurrentCategory }) {
  return (
    <aside>
      <ul>
        <li className="category">
          <button className="btn btn-all-categories" onClick={() => setCurrentCategory("all")}>
            All
          </button>
        </li>
        {CATEGORIES.map((cat) => (
          <li key={cat.name} className="category">
            <button
              className="btn btn-category"
              style={{ backgroundColor: cat.color }}
              onClick={() => setCurrentCategory(cat.name)}
            >
              {cat.name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

// Data that never changes (ie, is never recreated so it is opposite to what wee see in React function component rerender)
function isValidHttpUrl(string) {
  let url;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

function NewfactForm({ setFacts, setShowForm }) {
  const [text, setText] = useState("");
  const [source, setSource] = useState("http://example.com");
  const [category, setCategory] = useState("");
  const [newfactIsUploadingToSupabase, setNewfactIsUploadingToSupabase] = useState(false);

  // Derived state (state/value that depends on the current state ('text' state))
  const textLength = text.length;

  async function handleSubmit(e) {
    e.preventDefault();

    // Check if submitted data is valid, if so, create a new fact
    if (text && source && isValidHttpUrl(source) && category && textLength <= 200) {
      // Create a new fact object
      // const newFact = {
      //   id: crypto.randomUUID(),
      //   text,
      //   source,
      //   category,
      //   votesInteresting: 0,
      //   votesMindblowing: 0,
      //   votesFalse: 0,
      //   createdIn: new Date().getFullYear(),
      // };

      setNewfactIsUploadingToSupabase(true);
      // Upload fact to supabase and receive the new fact object
      // .select() to also receive the newly created object from the supabase db
      const { data: newFact, error } = await supabase.from("facts").insert([{ text, source, category }]).select();

      setNewfactIsUploadingToSupabase(false);

      // Add the new fact to the UI, ie, add the fact to the state
      // Set the new state based on the previous SAME state
      if (!error) setFacts((facts) => [newFact[0], ...facts]);

      // Reset the input fields
      setText("");
      setSource("");
      setCategory("");

      // Close the form
      setShowForm(false);
    }
  }

  return (
    // onSubmit={function reference ONLY and NOT the function call}
    <form className="fact-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Share a fact with the world..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <span>{200 - textLength}</span>
      <input
        type="text"
        placeholder="Trustworthy source..."
        value={source}
        onChange={(e) => setSource(e.target.value)}
        disabled={newfactIsUploadingToSupabase}
      />

      <select value={category} onChange={(e) => setCategory(e.target.value)} disabled={newfactIsUploadingToSupabase}>
        <option value="">Choose category:</option>
        {CATEGORIES.map((cat) => (
          <option value={cat.name} key={cat.name}>
            {cat.name.toUpperCase()}
          </option>
        ))}
      </select>

      {/* Disable this button immediately after the new fact is being uploaded to the supabase to prevent multiple clicks on this button */}
      <button className="btn btn-large" disabled={newfactIsUploadingToSupabase}>
        Post
      </button>
    </form>
  );
}

function FactList({ facts, setFacts }) {
  if (facts.length === 0) return <p className="message">There are no facts for this category!</p>;

  return (
    <section>
      <ul className="facts-list">
        {facts.map((fact) => (
          <Fact key={fact.id} factObj={fact} setFacts={setFacts} />
        ))}
      </ul>
      <p>There are {facts.length} facts in this list, Time to add yours!</p>
    </section>
  );
}

function Fact({ factObj, setFacts }) {
  const [isVoteCountUpdatingInSupabase, setIsVoteCountUpdatingInSupabase] = useState(false);
  const isDisputed = factObj.votesinteresting + factObj.votesMindblowing < factObj.votesFalse;
  // console.log(factObj);

  async function handleVoteClick(columnName) {
    setIsVoteCountUpdatingInSupabase(true);
    const { data: updatedFact, error } = await supabase
      .from("facts")
      .update({ [columnName]: factObj[columnName] + 1 })
      .eq("id", factObj.id)
      .select();

    setIsVoteCountUpdatingInSupabase(false);

    if (!error) setFacts((facts) => facts.map((f) => (f.id === factObj.id ? updatedFact[0] : f)));
  }

  return (
    <li className="fact">
      <p>
        {isDisputed ? <span className="disputed">[ DISPUTED FACT]</span> : null}
        {factObj.text}
        <a className="source" href={factObj.source} rel="noreferrer" target="_blank">
          (Source)
        </a>
      </p>
      <span className="tag" style={{ backgroundColor: CATEGORIES.find((cat) => cat.name === factObj.category).color }}>
        {factObj.category}
      </span>
      <div className="vote-buttons">
        <button onClick={() => handleVoteClick("votesinteresting")} disabled={isVoteCountUpdatingInSupabase}>
          👍 {factObj.votesinteresting}
        </button>
        <button onClick={() => handleVoteClick("votesMindblowing")} disabled={isVoteCountUpdatingInSupabase}>
          🤯 {factObj.votesMindblowing}
        </button>
        <button onClick={() => handleVoteClick("votesFalse")} disabled={isVoteCountUpdatingInSupabase}>
          ⛔️ {factObj.votesFalse}
        </button>
      </div>
    </li>
  );
}
export default App;
