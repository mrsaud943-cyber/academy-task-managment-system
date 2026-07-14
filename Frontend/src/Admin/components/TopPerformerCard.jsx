import React from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, Medal, Star, User, Award, Loader2, ChevronRight, Crown } from "lucide-react";

const TopPerformersCard = ({ performers = [], loading = false }) => {
  const navigate = useNavigate();

  const getMedalColor = (index) => {
    const colors = {
      0: "text-[var(--warning)]",
      1: "text-[var(--text-muted)]",
      2: "text-[var(--accent-light)]",
    };
    return colors[index] || "text-[var(--text-muted)]";
  };

  const getMedalIcon = (index) => {
    if (index === 0) return <Crown className="w-4 h-4" />;
    if (index === 1) return <Medal className="w-4 h-4" />;
    if (index === 2) return <Medal className="w-4 h-4" />;
    return <Star className="w-4 h-4" />;
  };

  const getRankLabel = (index) => {
    const labels = ["1st", "2nd", "3rd", "4th", "5th"];
    return labels[index] || `${index + 1}th`;
  };

  const getMarksColor = (marks) => {
    if (marks >= 80) return "text-[var(--success)]";
    if (marks >= 60) return "text-[var(--accent-primary)]";
    if (marks >= 40) return "text-[var(--warning)]";
    return "text-[var(--danger)]";
  };

  const getProgressColor = (marks) => {
    if (marks >= 80) return "bg-[var(--success)]";
    if (marks >= 60) return "bg-[var(--accent-primary)]";
    if (marks >= 40) return "bg-[var(--warning)]";
    return "bg-[var(--danger)]";
  };

  const getRankBorderColor = (index) => {
    const colors = {
      0: "border-[var(--warning)]/30 bg-[var(--warning)]/5",
      1: "border-[var(--text-muted)]/30 bg-[var(--text-muted)]/5",
      2: "border-[var(--accent-light)]/30 bg-[var(--accent-light)]/5",
    };
    return colors[index] || "border-[var(--border-color)] bg-[var(--bg-secondary)]/50";
  };

  const handleViewAll = () => {
    navigate("/admin/employees-ranking");
  };

  if (loading) {
    return (
      <div className="ui-card">
        <div className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[var(--warning)]/10">
              <Trophy className="w-4 h-4 text-[var(--warning)]" />
            </div>
            <h3 className="text-sm font-medium text-[var(--text-primary)]">Top Performers</h3>
          </div>
          <Loader2 className="w-4 h-4 text-[var(--warning)] animate-spin" />
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-[var(--warning)] animate-spin" />
        </div>
      </div>
    );
  }

  if (!performers || performers.length === 0) {
    return (
      <div className="ui-card">
        <div className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[var(--warning)]/10">
              <Trophy className="w-4 h-4 text-[var(--warning)]" />
            </div>
            <h3 className="text-sm font-medium text-[var(--text-primary)]">Top Performers</h3>
          </div>
          <span className="text-xs text-[var(--text-muted)]">0</span>
        </div>
        <div className="p-6 text-center">
          <Award className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-2" />
          <p className="text-[var(--text-secondary)] text-sm">No data available</p>
          <p className="text-[var(--text-muted)] text-xs mt-1">Complete tasks to see rankings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ui-card">
      <div className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[var(--warning)]/10">
            <Trophy className="w-4 h-4 text-[var(--warning)]" />
          </div>
          <h3 className="text-sm font-medium text-[var(--text-primary)]">Top Performers</h3>
        </div>
        <button
          onClick={handleViewAll}
          className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          View All
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-3 divide-y divide-[var(--border-color)]">
        {performers.slice(0, 5).map((performer, index) => (
          <div
            key={performer.userId}
            className={`py-3 flex items-center gap-3 ${
              index === 0 ? "pt-0" : ""
            } ${index === performers.slice(0, 5).length - 1 ? "pb-0" : ""}`}
          >
            {/* Rank */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getMedalColor(index)} bg-[var(--bg-secondary)]/50 border ${getRankBorderColor(index)}`}>
              {getMedalIcon(index)}
            </div>

            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-hover)] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
              {performer.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                  {performer.name}
                </p>
                <span className="text-[10px] font-medium text-[var(--text-muted)]">
                  #{getRankLabel(index)}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-[var(--text-muted)] flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {performer.taskCount} tasks
                </span>
                <span className={`font-semibold ${getMarksColor(performer.avgMarks)}`}>
                  {performer.avgMarks} avg
                </span>
              </div>
            </div>

            {/* Score */}
            <div className={`text-sm font-bold ${getMarksColor(performer.avgMarks)}`}>
              {performer.avgMarks}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopPerformersCard;