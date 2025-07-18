import { Badge } from "@/components/ui/badge";
import { Leaf, Award, Star } from "lucide-react";

interface ESGScoreBadgeProps {
  score: number;
  size?: "small" | "medium" | "large";
  showIcon?: boolean;
}

export function ESGScoreBadge({ score, size = "medium", showIcon = true }: ESGScoreBadgeProps) {
  const getScoreLevel = (score: number) => {
    if (score >= 80) return { level: "Excellent", color: "success", icon: Award };
    if (score >= 60) return { level: "Good", color: "primary", icon: Star };
    if (score >= 40) return { level: "Fair", color: "warning", icon: Leaf };
    return { level: "Basic", color: "muted", icon: Leaf };
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-success text-success-foreground";
    if (score >= 60) return "bg-primary text-primary-foreground"; 
    if (score >= 40) return "bg-warning text-warning-foreground";
    return "bg-muted text-muted-foreground";
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case "small":
        return "text-xs px-2 py-1";
      case "large":
        return "text-sm px-4 py-2";
      default:
        return "text-xs px-3 py-1";
    }
  };

  const { level, icon: Icon } = getScoreLevel(score);

  return (
    <div className={`inline-flex items-center gap-2 ${size === "large" ? "p-3 bg-gradient-card rounded-lg" : ""}`}>
      <Badge className={`${getScoreColor(score)} ${getSizeClasses(size)} flex items-center gap-1`}>
        {showIcon && <Icon className={`${size === "large" ? "h-4 w-4" : "h-3 w-3"}`} />}
        <span>ESG Score: {score}</span>
      </Badge>
      {size === "large" && (
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Environmental Impact Level</p>
          <p className="font-medium text-sm">{level}</p>
        </div>
      )}
    </div>
  );
}