import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

const categories = ["new", "top", "best", "job"] as const;
type Category = (typeof categories)[number];

interface IStory {
  id: number;
  title: string;
  url: string;
  score: number;
}

async function api<Response>(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return response.json() as Promise<Response>;
}

function Tabs({selected, onSelect}: {
  selected: Category;
  onSelect: (category: Category) => void;
}) {
  return (
    <div className="tabs is-toggle is-fullwidth">
      <ul>
        {categories.map((category) => (
          <li key={category} className={selected === category ? "is-active" : ""}>
            <a onClick={() => { onSelect(category)}}>
              <span style={{ textTransform: "capitalize" }}>{category}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Story({ id }: { id: number }) {
  const storyQuery = useQuery({
    queryKey: ["story", id],
    queryFn: () => api<IStory>(`https://hacker-news.firebaseio.com/v0/item/${id}.json`),
  });

  if (storyQuery.isError) return <div>Error: {storyQuery.error.message}</div>

  return (
    <div className="box">
      <div className="columns is-mobile">
        {storyQuery.isLoading ? (
          <i className="fa fa-cog fa-spin fa-2x" style={{margin: "10px auto"}} />
        ) : (
          <>
            <div className="column is-narrow">
              <div className="icon" style={{ marginLeft: "20px" }}>
                <i className="fa fa-poll fa-2x"></i>
                <span style={{ margin: "0 10px" }}>
                  {storyQuery.data?.score}
                </span>
              </div>
            </div>
            <div className="column">
              {
                storyQuery.data?.url ? 
                  <a target="_blank" href={storyQuery.data?.url} style={{ textDecoration: "underline" }}>
                    {storyQuery.data?.title}
                  </a>
                : <p>{storyQuery.data?.title}</p>
              }
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function App() {
  const [category, setCategory] = useState<Category>("new");

  const storiesQuery = useQuery({
    queryKey: ["stories", category],
    queryFn: () => api<number[]>(`https://hacker-news.firebaseio.com/v0/${category}stories.json`),
  });

  if (storiesQuery.isError) return <div>Error: {storiesQuery.error.message}</div>

  return (
    <div style={{padding: '20px'}}>
      <h1 className="title">Vanilla React Hacker News</h1>
      <Tabs selected={category} onSelect={setCategory} />
      {storiesQuery.data?.slice(0, 10).reverse().map((id) => <Story key={id} id={id} />)}
    </div>
  );
}

export default App;