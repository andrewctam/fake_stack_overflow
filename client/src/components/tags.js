import { useState, useEffect } from 'react'
import { config, s } from "../utils";
import axios from "axios"

export default function Tags(props) {
  const { viewHome, viewAskQuestion } = props;
  const [tags, setTags] = useState(null);

  useEffect(() => {
    const getTags = async () => {
      const url = "http://localhost:8000/tags/all";
  
      await axios.get(url, config)
        .then(res => setTags(res.data))
        .catch(err => console.log(err));
    }

    getTags();
    
  }, [])

  

  if (!tags) return;

  const filterTag = (tag) => {
    viewHome(`Questions tagged with ${tag}`, `[${tag}]`);
  }
  console.log(tags)

  return (
    <div>
      <div className="tagsTop">
        <div>{tags.length} tag{s(tags.length)}</div>
        <div> All Tags </div>
        <button id="askQ" onClick={viewAskQuestion}> Ask Question </button>
      </div>


      <div className="tags">
        {tags.map((t) =>
          <div className="tag" key={"TAG" + t.name}>
            <div id={t.name} className="tagName" onClick={() => filterTag(t.name)}>{t.name}</div>
            <div className="tagCount">{t.count} question{s(t.count)}</div>
          </div>)}
      </div>
    </div>
  )
}