import axios from "axios";
import { useEffect, useState } from "react";
import { config, formatAskDate } from "../../utils";
import ProfileTag from "./profile-tag";
import UserItem from "./user-item";
import HomeQuestion from "../home/home-question";

export default function Profile(props) {
    const { uid, editQuestion, viewQuestionUserFirst, viewHome } = props;

    const [user, setUser] = useState(uid);
    const [userInfo, setUserInfo] = useState(null);
    const [error, setError] = useState("")
    const [page, setPage] = useState(0)
    const [currentView, setCurrentView] = useState("");

    useEffect(() => {
        const getProfile = async () => {
            const url = `http://localhost:8000/users/profile/${user}`;

            await axios.get(url, config)
                .then((res) => {
                    console.log(res)
                    setUserInfo(res.data)
                })
                .catch((err) => {
                    setError(err?.response?.data ?? "Error communicating with server");
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
            <div>{`${userInfo.username}'s Profile${userInfo.isAdmin ? " (Admin)" : ""}`}</div>
            <div>Reputation: {userInfo.reputation}</div>
            <div>Member Since: {formatAskDate(new Date(userInfo.joinDate))}</div>
        </div>

        {userInfo.isAdmin ? (<>
            <h2>Users List</h2>
            <ul>
                {userInfo.users.map((user) => (
                    <UserItem
                        key={user._id}
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
                    <li className="profileTitle" key={q._id} onClick={() => { editQuestion(q._id) }}>
                        {q.title}
                    </li>
                )}

                {userInfo.questions.length === 0 && <div>No Questions Posted</div>}
            </ul>
            {currentView === "" && (
                <>
                    <div className="profileLink" onClick={() => setCurrentView("Tags")}>
                        View Tags Created
                    </div>
                    <div className="profileLink" onClick={() => setCurrentView("QuestionsAnswered")}>
                        View Questions Answered
                    </div>
                </>
            )}
            {currentView === "Tags" && (<>
                <div className="profileLink" onClick={() => setCurrentView("")}>
                    Close Tags Created
                </div>
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
            </>)}

            {currentView === "QuestionsAnswered" && (<>
                <div className="profileLink" onClick={() => setCurrentView("")}>
                    Close Questions Answered
                </div>
                {userInfo.tags.length === 0 && <ul><div>No Tags Created</div></ul>}
                <h2>Questions Answered</h2>
                <div id="questionsList" className="questionsList">
                    {userInfo.questionsAnswered.slice(page * 5, (page + 1) * 5).map(q =>
                        <HomeQuestion
                            key={"QUESTION" + q._id}
                            viewQuestion={() => viewQuestionUserFirst(q._id, user)}
                            q={q}
                        />
                    )}

                    {userInfo.questionsAnswered.length === 0 && <div>No Questions Answered</div>}
                </div>

                {userInfo.questionsAnswered.length > 5 &&
                    (<div className="pageBtns">
                        <button className="pageBtn"
                            disabled={page <= 0}
                            onClick={() => { setPage(page - 1) }}>
                            Prev</button >
                        <button className="pageBtn"
                            disabled={page >= Math.ceil(userInfo.questionsAnswered.length / 5) - 1}
                            onClick={() => { setPage(page + 1) }}>
                            Next</button>
                    </div>
                    )
                }
            </>)}
        </>)}
    </div>
    )

}