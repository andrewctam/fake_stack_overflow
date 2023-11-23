import { useState } from "react";
import { config, isEmpty } from "../../utils";
import axios from "axios";

export default function AddComment(props) {
    const { parent, parentType, addCommentLocal } = props

    const [text, setText] = useState("")
    const [textError, setTextError] = useState("")
    const [error, setError] = useState("")

    const add = async () => {
        setTextError("");

        if (isEmpty(text)) {
            setTextError("Answer is empty");
            return;
        }

        const body = {
            parent,
            parentType,
            text,
        }

        const url = `http://localhost:8000/comments/create`
        await axios.post(url, body, config)
            .then(res => {
                console.log(res)
                addCommentLocal(res.data)
                setText("")
                setError("")
                setTextError("")
            })
            .catch(err => {
                console.log(err)
                setError(err?.response?.data)
            });
    }


    return (
        <div className = "addComment">
            <textarea onInput={(e) => { setText(e.target.value) }} value={text} />
            <p className="inputError">{error}</p>
            <button onClick={add}>Add Comment</button>
            <p className="inputError">{textError}</p>
        </div>

    )
}