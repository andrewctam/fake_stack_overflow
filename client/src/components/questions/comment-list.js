import { useState } from "react";
import AddComment from "./add-comment";
import CommentDisplay from "./comment-display";

export default function CommentList(props) {
    const { comments, parentType, loggedIn, id } = props;

    const [newComments, setNewComments] = useState([]);
    const [page, setPage] = useState(0);

    const addCommentLocal = (comment) => {
        setNewComments([
            comment,
            ...newComments
        ]);
    }

    const allComments = newComments.concat(comments);

    return (
        <div className="comments">
            <h2>Comments</h2>
            <div className="answersList">
                {allComments.slice((page) * 3, (page + 1) * 3).map(c =>
                    <CommentDisplay
                        commentId={c._id}
                        commenter={c.commenter}
                        text={c.text}
                        votes={c.votes}
                        loggedIn={loggedIn}
                    />
                )}

                {allComments.length > 3 &&
                    (<div className="pageBtns">
                        <button className="pageBtn"
                            disabled={page <= 0}
                            onClick={() => { setPage(page - 1) }}>
                            Prev</button >
                        <button className="pageBtn"
                            disabled={page >= Math.ceil(allComments.length / 3) - 1}
                            onClick={() => { setPage(page + 1) }}>
                            Next</button>
                    </div>)}

                <AddComment
                    parent={id}
                    parentType={parentType}
                    addCommentLocal={addCommentLocal}
                />
            </div>
        </div>)

}