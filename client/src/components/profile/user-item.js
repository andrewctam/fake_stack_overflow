import { useState } from "react";
import { config } from "../../utils";
import axios from "axios";

export default function UserItem(props) {
    const { username, setUser, uid } = props;



    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState("");
    const [deleted, setDeleted] = useState(false);

    const deleteUser = async () => {
        const url = `http://localhost:8000/users/delete`;
        const body = {
            userIdDelete: uid
        }

        await axios.post(url, body, config)
            .then((res) => {
                setDeleted(true)
            })
            .catch((err) => {
                console.log(err)
                setError(err?.response?.data)
            });
    }
    if (deleted) {
        return (
            <li className="userItem">{username} successfully deleted</li>
        )
    }
    return (
        <li className="userItem">
            <span onClick={() => setUser(uid)}>{username}</span>

            <div onClick={() => { setShowConfirm(!showConfirm) }}
                className={`delUser ${showConfirm ? "cancel" : "inputError"}`}>
                {showConfirm ? "Cancel" : "Delete User"}
            </div>

            {showConfirm &&
                <div>
                    Are you sure you want to delete this user?
                    <div className="delUser inputError" onClick={deleteUser}>
                        Confirm Deletion
                    </div>
                </div>}

            <div className="inputError">{error}</div>
        </li>

    )
}