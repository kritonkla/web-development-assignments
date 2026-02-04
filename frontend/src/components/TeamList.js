import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

function TeamList({ username, onLogout }) {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [newTeamName, setNewTeamName] = useState("");

  useEffect(() => {
    fetchTeamsFromTodos();
  }, [username]);

  const fetchTeamsFromTodos = async () => {
    try {
      const mockTeams = [
        {
          id: 1,
          name: `${username}'s Team`,
          role: "admin",
          taskCount: 0,
        },
      ];
      setTeams(mockTeams);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTeam = (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    const newTeam = {
      id: Date.now(),
      name: newTeamName,
      role: "admin",
      taskCount: 0,
    };

    setTeams([...teams, newTeam]);
    setNewTeamName("");
    document.getElementById("create_team_modal").close();
  };

  return (
    // 1. เอาสีพื้นหลัง (bg-...) ออกจากตัวแม่ เหลือแค่รูปทรงและสีตัวอักษร
    <div className="rounded-xl overflow-hidden text-white shadow-lg">
      
      {/* 2. ใส่สีส้ม bg-orange-500 ที่ส่วน Header */}
      <div className="bg-orange-500 relative px-6 py-4 border-b border-white/10 flex items-center justify-end">
        <h3 className="absolute left-1/2 -translate-x-1/2 text-lg font-semibold">
          My Teams
        </h3>
        <button
          className="w-9 h-9 rounded-full flex items-center justify-center bg-white/20 hover:bg-white/30 text-xl backdrop-blur-sm transition"
          onClick={() =>
            document.getElementById("create_team_modal").showModal()
          }
        >
          +
        </button>
      </div>

      {/* 3. ใส่สีเทา bg-slate-800 ที่ส่วน List (เนื้อหาข้างล่าง) */}
      <ul className="bg-zinc-500 min-h-[100px]"> 
        {teams.map((team) => (
          <li key={team.id}>
            <div
              className="px-6 py-4 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0"
              onClick={() => navigate(`/teams/${team.id}`)}
            >
              <div className="flex justify-between items-start">
                <p className="font-medium">{team.name}</p>
                <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400">
                  {team.role}
                </span>
              </div>
              <p className="mt-2 text-sm text-white/60">
                Tasks: {team.taskCount}
              </p>
            </div>
          </li>
        ))}
        
        {teams.length === 0 && (
          <li className="px-6 py-8 text-center text-white/40 text-sm">
             No teams yet
          </li>
        )}
      </ul>

      {/* Modal (ส่วนนี้เหมือนเดิม) */}
      <dialog id="create_team_modal" className="modal rounded-lg text-slate-800">
        <div className="modal-box w-80 rounded-xl p-6 bg-white">
          <h3 className="font-semibold text-lg text-slate-900">Create Team</h3>

          <input
            type="text"
            placeholder="Team name"
            className="input input-bordered w-full mt-4 rounded-lg bg-white border-slate-300 text-slate-900"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
          />

          <div className="modal-action mt-6">
            <form method="dialog" className="flex gap-2">
              <button
                className="btn btn-sm btn-ghost text-gray-500 hover:bg-gray-100 rounded-lg"
                onClick={() => setNewTeamName("")}
              >
                Cancel
              </button>

              <button
                className="btn btn-sm bg-slate-900 text-white hover:bg-slate-800 rounded-lg"
                onClick={handleCreateTeam}
              >
                Create
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
}

export default TeamList;