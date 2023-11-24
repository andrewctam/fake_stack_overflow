import axios from "axios";
import { useEffect, useState } from "react";
import { config, formatAskDate } from "../../utils";
import ProfileTag from "./profile-tag";
import UserItem from "./user-item";

export default function Profile(props) {
    const { uid, editQuestion, viewQuestionUserFirst, viewHome } = props;

    const [user, setUser] = useState(uid);
    const [userInfo, setUserInfo] = useState(null);
    const [error, setError] = useState("")

    useEffect(() => {
        const getProfile = async () => {
            const url = `http://localhost:8000/users/profile/${user}`;

            await axios.get(url, config)
                .then((res) => {
                    console.log(res)
                    setUserInfo(res.data)
                })
                .catch((err) => {
                    setError(err?.response?.data)
                    console.log(err)
                });
        }

        getProfile();
    }, [user])

    if (error) return <div className="inputError pfError">{error}</div>
    if (!userInfo) return null;

    const sortQuestions = (a, b) => (a.ask_date_time < b.ask_date_time ? 1 : -1);
    return (<div className="profile">
        <div className="userStats">
            <div>{userInfo.username}'s Profile</div>
            <div>Reputation: {userInfo.reputation}</div>
            <div>Member Since: {formatAskDate(new Date(userInfo.joinDate))}</div>
        </div>

        {userInfo.isAdmin ? (<>
            <h2>Users List</h2>
            <ul>
                {userInfo.users.map((user) => (
                    <UserItem
                        username={user.username}
                        uid={user.userId}
                        setUser={setUser}
                    />
                ))}

                {userInfo.users.length === 0 && <div>No Users</div>}
            </ul>
        </>) : (<>
            <h2>Questions Posted</h2>
            <ul id="questionsList" className="questionsList">
                {userInfo.questions.sort(sortQuestions).map(q =>
                    <li className="profileTitle" key={q._id} onClick={() => { editQuestion(q) }}>
                        {q.title}
                    </li>
                )}

                {userInfo.questions.length === 0 && <div>No Questions Posted</div>}
            </ul>

            <h2>Questions Answered</h2>
            <ul id="questionsList" className="questionsList">
                {userInfo.questionsAnswered.sort(sortQuestions).map(q =>
                    <li className="profileTitle" key={q._id} onClick={() => { viewQuestionUserFirst(q._id, user) }}>
                        {q.text}
                    </li>
                )}

                {userInfo.questionsAnswered.length === 0 && <div>No Questions Answered</div>}
            </ul>

            <h2>Tags Created</h2>
            <div className="tags">
                {userInfo.tags.map(t =>
                    <ProfileTag
                        key={t._id}
                        tid={t._id}
                        name={t.name}
                        count={t.count}
                        viewHome={viewHome}
                    />)}
            </div>
            {userInfo.tags.length === 0 && <ul><div>No Tags Created</div></ul>}
        </>)
        }
    </div>
    )

}