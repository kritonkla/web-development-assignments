import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaUserPlus, FaUserTimes } from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

function TeamDashboard({ user, team, onBack }) {
    const [tasks, setTasks] = useState([]);
    const [members, setMembers] = useState([]);
    const [allUsers, setAllUsers] = useState([]); // For the "Add Member" dropdown
    
    // Form States
    const [newTaskName, setNewTaskName] = useState('');
    const [newTaskDate, setNewTaskDate] = useState('');
    const [assigneeId, setAssigneeId] = useState('');
    const [newMemberId, setNewMemberId] = useState('');

    const isAdmin = user.id === team.admin_id;

    useEffect(() => {
        fetchTeamData();
        if (isAdmin) fetchAllUsers();
        // eslint-disable-next-line
    }, [team]);

    const fetchTeamData = async () => {
        try {
            // 1. Fetch Members
            const memRes = await fetch(`${API_URL}/team/${team.id}/members`);
            const memData = await memRes.json();
            setMembers(memData);

            // 2. Fetch Tasks
            const taskRes = await fetch(`${API_URL}/team/${team.id}/tasks`);
            const taskData = await taskRes.json();
            setTasks(taskData);
        } catch (err) { console.error(err); }
    };

    const fetchAllUsers = async () => {
        try {
            const res = await fetch(`${API_URL}/get-users`);
            const data = await res.json();
            setAllUsers(data);
        } catch (err) { console.error(err); }
    };

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!newTaskName || !assigneeId) return alert("Name and Assignee required");

        try {
            const res = await fetch(`${API_URL}/team/add-task`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    task: newTaskName,
                    target_date: newTaskDate,
                    assigned_id: assigneeId,
                    team_id: team.id,
                    status: 0
                })
            });
            if (res.ok) {
                setNewTaskName('');
                fetchTeamData(); // Refresh list
            }
        } catch (err) { console.error(err); }
    };

    const handleAddMember = async () => {
        if (!newMemberId) return;
        try {
            const res = await fetch(`${API_URL}/team/add-member`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userid: newMemberId, teamid: team.id })
            });
            if (res.ok) {
                setNewMemberId('');
                fetchTeamData();
            }
        } catch (err) { console.error(err); }
    };

    const handleRemoveMember = async (userId) => {
        if (!window.confirm("Remove this member?")) return;
        try {
            await fetch(`${API_URL}/team/del-member`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userid: userId, teamid: team.id })
            });
            fetchTeamData();
        } catch (err) { console.error(err); }
    };

    const handleDeleteTask = async(task_id) => {
        try {
            const res = await fetch(`${API_URL}/todos/${task_id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                fetchTeamData();
            }
        } catch (err) {console.log(err);}
    }

    const handleStatusChange = async (taskId, currentStatus) => {
        // Status Logic: 0 (Todo) -> 2 (Doing) -> 1 (Done) -> 0
        let nextStatus = 0;
        if (currentStatus === 0) nextStatus = 2;
        else if (currentStatus === 2) nextStatus = 1;
        else nextStatus = 0;

        try {
            const res = await fetch(`${API_URL}/todos/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: nextStatus })
            });
            if (res.ok) fetchTeamData();
        } catch (err) { console.error(err); }
    };

    return (
        <div className="p-6 h-full flex flex-col bg-gray-50 dark:bg-gray-800 overflow-y-auto">
            <button onClick={onBack} className="text-blue-500 hover:underline mb-4 self-start">
                &larr; Back to Teams
            </button>
            
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{team.name}</h1>
                {isAdmin && <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">Admin View</span>}
            </div>

            {/* --- ADMIN SECTION --- */}
            {isAdmin && (
                <div className="bg-white dark:bg-gray-700 p-4 rounded-xl shadow-sm mb-6 border border-blue-100 dark:border-gray-600">
                    <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-3">Admin Controls</h3>
                    
                    {/* Add Member */}
                    <div className="flex gap-2 mb-4">
                        <select 
                            className="p-2 rounded border dark:bg-gray-600 dark:text-white"
                            value={newMemberId}
                            onChange={(e) => setNewMemberId(e.target.value)}
                        >
                            <option value="">Select User to Add...</option>
                            {allUsers.map(u => (
                                <option key={u.id} value={u.id}>{u.username}</option>
                            ))}
                        </select>
                        <button onClick={handleAddMember} className="bg-green-500 text-white p-2 rounded hover:bg-green-600">
                            <FaUserPlus />
                        </button>
                    </div>

                    {/* Create Task */}
                    <form onSubmit={handleAddTask} className="flex flex-col gap-2 md:flex-row">
                        <input 
                            type="text" 
                            placeholder="New Team Task..." 
                            className="flex-1 p-2 rounded border dark:bg-gray-600 dark:text-white"
                            value={newTaskName}
                            onChange={(e) => setNewTaskName(e.target.value)}
                        />
                        <select 
                            className="p-2 rounded border dark:bg-gray-600 dark:text-white"
                            value={assigneeId}
                            onChange={(e) => setAssigneeId(e.target.value)}
                        >
                            <option value="">Assign to...</option>
                            {members.map(m => (
                                <option key={m.id} value={m.id}>{m.username}</option>
                            ))}
                        </select>
                        <input 
                            type="datetime-local" 
                            className="p-2 rounded border dark:bg-gray-600 dark:text-white"
                            value={newTaskDate}
                            onChange={(e) => setNewTaskDate(e.target.value)}
                        />
                        <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
                            <FaPlus /> Task
                        </button>
                    </form>
                </div>
            )}

            {/* --- MEMBERS LIST --- */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Members</h3>
                <div className="flex flex-wrap gap-2">
                    {members.map(mem => (
                        <div key={mem.id} className="flex items-center gap-2 bg-white dark:bg-gray-600 px-3 py-1 rounded-full shadow-sm border">
                            <img src={mem.profile_url || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"} alt="avatar" referrerPolicy="no-referrer" className="w-6 h-6 rounded-full" />
                            <span className="text-sm dark:text-white">{mem.username}</span>
                            {isAdmin && mem.id !== user.id && (
                                <button onClick={() => handleRemoveMember(mem.id)} className="text-red-400 hover:text-red-600 ml-1">
                                    <FaUserTimes size={12} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* --- TEAM TASKS --- */}
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Team Tasks</h3>
            <div className="space-y-3">
                {tasks.map(task => {
                    // Logic: Can edit if Admin OR if assigned to user
                    const canEdit = isAdmin || task.assigned_id === user.id;

                    return (
                        <div key={task.id} className={`p-4 rounded-xl border flex items-center justify-between bg-white dark:bg-gray-600 ${task.status === 1 ? 'opacity-60' : ''}`}>
                            <div className="flex items-center gap-4">
                                <button
                                    disabled={!canEdit}
                                    onClick={() => handleStatusChange(task.id, task.status)}
                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                                        ${task.status === 1 ? 'bg-green-500 border-green-500' : 'border-gray-300'}
                                        ${!canEdit ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                                    `}
                                >
                                    {task.status === 1 && <div className="w-2 h-2 bg-white rounded-full" />}
                                    {task.status === 2 && <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />}
                                </button>
                                <div>
                                    <p className={`font-medium dark:text-white ${task.status === 1 ? 'line-through' : ''}`}>{task.name}</p>
                                    <p className="text-xs text-gray-400">Assigned to: {task.assignee_name}</p>
                                </div>
                            </div>
                            
                            {/* Only Admin can delete tasks */}
                            {isAdmin && (
                                <button className="text-gray-300 hover:text-red-500" onClick={() => handleDeleteTask(task.id)}><FaTrash /></button>
                            )}
                        </div>
                    );
                })}
                {tasks.length === 0 && <p className="text-gray-400 text-center italic mt-4">No tasks in this team yet.</p>}
            </div>
        </div>
    );
}

export default TeamDashboard;