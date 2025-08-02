import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MapPin, Calendar, Award, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const VisualImpactSummary = () => {
  const impactCases = [
    {
      id: 1,
      title: "Coral Reef Restoration",
      location: "Semporna, Sabah",
      partner: "ReefGuard Malaysia",
      description: "Your sustainable purchases funded coral nursery expansion",
      progress: 78,
      badge: "🌊",
      badgeText: "Ocean Saver",
      date: "Nov 2024",
      imageUrl: "/lovable-uploads/semporna_reef.jpg",
      contribution: "2500 points contributed",
      impact: "0.5m² of coral reef restored"
    },
    {
      id: 2,
      title: "Rainforest Conservation",
      location: "Taman Negara, Pahang",
      partner: "Malaysian Nature Society",
      description: "Supporting indigenous communities through eco-tourism",
      progress: 65,
      badge: "🌳",
      badgeText: "Forest Guardian",
      date: "Oct 2024",
      imageUrl: "/lovable-uploads/taman_negara.jpg",
      contribution: "500 points contributed",
      impact: "12 trees protected"
    },
    {
      id: 3,
      title: "Marine Plastic Cleanup",
      location: "Langkawi, Kedah",
      partner: "Clean Ocean Initiative",
      description: "Removing plastic waste from critical marine habitats",
      progress: 92,
      badge: "♻️",
      badgeText: "Waste Warrior",
      date: "Dec 2024",
      imageUrl: "/lovable-uploads/langkawi_beach.jpg",
      contribution: "1000 points contributed",
      impact: "45kg plastic removed"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Your Environmental Impact</h2>
          <p className="text-sm text-muted-foreground">See how your sustainable choices make a real difference</p>
        </div>
        <Badge variant="secondary" className="gap-2">
          <Award className="h-3 w-3" />
          3 Active Projects
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {impactCases.map((impact) => (
          <Card key={impact.id} className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
            <div className="relative">
              <img 
                src={impact.imageUrl} 
                alt={impact.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-3 right-3">
                <Badge className="bg-background/90 text-foreground backdrop-blur-sm">
                  {impact.badge} {impact.badgeText}
                </Badge>
              </div>
              <div className="absolute bottom-3 left-3">
                <div className="flex items-center gap-1 text-white text-xs bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
                  <MapPin className="h-3 w-3" />
                  {impact.location}
                </div>
              </div>
            </div>
            
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg leading-tight">{impact.title}</CardTitle>
                  <p className="text-xs text-primary font-medium mt-1">
                    In partnership with {impact.partner}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0 ml-2">
                  <Calendar className="h-3 w-3" />
                  {impact.date}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0 space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {impact.description}
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Project Progress</span>
                  <span className="font-medium">{impact.progress}%</span>
                </div>
                <Progress value={impact.progress} className="h-2" />
              </div>
              
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="text-center p-2 bg-muted/50 rounded-lg">
                  <div className="text-xs text-muted-foreground">Your Contribution</div>
                  <div className="text-sm font-semibold text-primary">{impact.contribution}</div>
                </div>
                <div className="text-center p-2 bg-muted/50 rounded-lg">
                  <div className="text-xs text-muted-foreground">Impact Created</div>
                  <div className="text-sm font-semibold text-success">{impact.impact}</div>
                </div>
              </div>
              
              <Button variant="outline" size="sm" className="w-full gap-2">
                <ExternalLink className="h-3 w-3" />
                View Certificate
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-gradient-to-r from-primary/5 to-success/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Total Environmental Impact</h3>
              <p className="text-sm text-muted-foreground">
                Your contributions this year have supported 3 conservation projects
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">5900 points</div>
              <div className="text-xs text-muted-foreground">Total contributed</div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <div className="text-lg font-bold text-success">0.5m²</div>
              <div className="text-xs text-muted-foreground">Coral Restored</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-success">12</div>
              <div className="text-xs text-muted-foreground">Trees Protected</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-success">45kg</div>
              <div className="text-xs text-muted-foreground">Plastic Removed</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
