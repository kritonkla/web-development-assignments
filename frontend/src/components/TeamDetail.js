import { useNavigate, useParams } from "react-router-dom";

function TeamDetail() {
  const { teamId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="p-6 text-black">
      {/* Header */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-sm rounded-full
             bg-slate-500 hover:bg-slate-700
             border border-white/10
             shadow-sm transition"
        >
          ← Back
        </button>
      </div>

      <h1 className="text-xl font-semibold text-black">Team Detail</h1>
      <p className="mt-2 text-black">Team ID: {teamId}</p>
    </div>
  );
}

export default TeamDetail;
