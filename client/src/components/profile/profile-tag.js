import { useState } from "react";
import { config, s } from "../../utils";
import axios from "axios";

export default function ProfileTag(props) {
    const { tid, name, count, viewHome } = props;

    const [tagName, setTagName] = useState(name);
    const [editTagText, setEditTagText] = useState(name);

    const [showEditor, setShowEditor] = useState(false);
    const [editError, setEditError] = useState(false);

    const [tagDeleted, setTagDeleted] = useState(false);
    const [delError, setDelError] = useState("");

    const toggle = () => {
        setShowEditor(!showEditor)
        setEditError("");
        setEditTagText(tagName)
    }

    const editTag = async () => {
        const body = {
            tid,
            newName: editTagText
        }

        const url = `http://localhost:8000/tags/edit`;
        await axios.post(url, body, config)
            .then((res) => {
                setEditError("");
                setTagName(editTagText);
                setShowEditor(false);
            })
            .catch((err) => {
                console.log(err)
                setEditError(err?.response?.data);
            })
    }
    const deleteTag = async () => {
        const body = {
            tid
        }

        const url = `http://localhost:8000/tags/delete`;
        await axios.post(url, body, config)
            .then((res) => {
                setTagDeleted(true)
            })
            .catch((err) => {
                console.log(err)
                setDelError(err?.response?.data);
            })
    }


  const filterTag = () => {
    viewHome(`Questions tagged with ${name}`, `[${name}]`);
  }

    if (tagDeleted) {
        return <div className="tag">
            <div>{tagName} was successfully deleted</div>
        </div>
    }
    return (
        <div className="tag">
            <div className="tagName" onClick={filterTag}>{tagName}</div>
            <div className="tagCount">{count} question{s(count)}</div>

            <hr />
            <div className="editTag" onClick={toggle}>
                {showEditor ? "Cancel Edit" : "Edit Tag"}
            </div>

            {showEditor && (
                <>
                    <input
                        className="tagEditInput"
                        onChange={(e) => setEditTagText(e.target.value)} value={editTagText} />
                    <div className="editTagSave" onClick={editTag}>
                        Save
                    </div>
                    <div className="inputError">{editError}</div>
                </>
            )}


            <div className="delTag" onClick={deleteTag}>Delete Tag</div>
            <div className="inputError">{delError}</div>
        </div>
    )
}