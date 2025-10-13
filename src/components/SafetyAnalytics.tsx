import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  MapPin, 
  Clock, 
  Users,
  Shield,
  AlertTriangle,
  CheckCircle,
  Activity
} from 'lucide-react';

const SafetyAnalytics = () => {
  const analyticsData = {
    totalReports: 247,
    resolvedIncidents: 231,
    avgResponseTime: '4.2 minutes',
    safetyScore: 92,
    trendDirection: 'up',
    hotspots: [
      { location: 'Beach District', incidents: 12, trend: 'down' },
      { location: 'Downtown Core', incidents: 8, trend: 'stable' },
      { location: 'Shopping Quarter', incidents: 5, trend: 'up' }
    ],
    recentIncidents: [
      { type: 'Medical', time: '2 hours ago', status: 'resolved', severity: 'medium' },
      { type: 'Theft', time: '4 hours ago', status: 'investigating', severity: 'low' },
      { type: 'Weather', time: '6 hours ago', status: 'resolved', severity: 'high' }
    ]
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-primary" />
              Safety Analytics
            </h1>
            <p className="text-muted-foreground mt-1">
              AI-powered insights and safety trends
            </p>
          </div>
          <Badge variant="outline" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Live Data
          </Badge>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Safety Score</p>
                  <p className="text-3xl font-bold text-success">{analyticsData.safetyScore}%</p>
                </div>
                <div className="p-3 bg-success/10 rounded-full">
                  <Shield className="h-6 w-6 text-success" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-sm text-success">+2.3% from last week</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Reports</p>
                  <p className="text-3xl font-bold text-primary">{analyticsData.totalReports}</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-sm text-success">12 this week</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                  <p className="text-3xl font-bold text-success">{analyticsData.resolvedIncidents}</p>
                </div>
                <div className="p-3 bg-success/10 rounded-full">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-sm text-muted-foreground">
                  {Math.round((analyticsData.resolvedIncidents / analyticsData.totalReports) * 100)}% resolution rate
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Response</p>
                  <p className="text-3xl font-bold text-warning">{analyticsData.avgResponseTime}</p>
                </div>
                <div className="p-3 bg-warning/10 rounded-full">
                  <Clock className="h-6 w-6 text-warning" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-sm text-success">15% faster</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Incident Trends */}
          <Card className="shadow-glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Incident Trends (7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-48 bg-gradient-to-br from-primary/5 to-success/5 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground font-medium">Interactive Chart</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Incident trend visualization
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-success">↓23%</div>
                    <div className="text-sm text-muted-foreground">Crime Reports</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-warning">↑8%</div>
                    <div className="text-sm text-muted-foreground">Medical</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">→</div>
                    <div className="text-sm text-muted-foreground">Weather</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Safety Hotspots */}
          <Card className="shadow-glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Safety Hotspots
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analyticsData.hotspots.map((hotspot, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      hotspot.trend === 'up' ? 'bg-danger' : 
                      hotspot.trend === 'down' ? 'bg-success' : 'bg-warning'
                    }`}></div>
                    <div>
                      <p className="font-medium">{hotspot.location}</p>
                      <p className="text-sm text-muted-foreground">{hotspot.incidents} incidents</p>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`${
                      hotspot.trend === 'up' ? 'text-danger border-danger/30' : 
                      hotspot.trend === 'down' ? 'text-success border-success/30' : 'text-warning border-warning/30'
                    }`}
                  >
                    {hotspot.trend === 'up' ? '↑' : hotspot.trend === 'down' ? '↓' : '→'} {hotspot.trend}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & AI Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Incidents */}
          <Card className="shadow-glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Recent Incidents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {analyticsData.recentIncidents.map((incident, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${
                    incident.severity === 'high' ? 'bg-danger' :
                    incident.severity === 'medium' ? 'bg-warning' : 'bg-success'
                  }`}></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{incident.type}</span>
                      <span className="text-sm text-muted-foreground">{incident.time}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          incident.status === 'resolved' ? 'text-success border-success/30' : 'text-warning border-warning/30'
                        }`}
                      >
                        {incident.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {incident.severity}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card className="shadow-glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-success">Safety Improvement Detected</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Beach District incidents decreased by 45% after implementing enhanced lighting and security patrols.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-primary">Tourist Flow Pattern</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Peak safety concerns occur between 2-4 PM in tourist areas. Consider additional monitoring during these hours.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-warning">Weather Alert Correlation</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Medical incidents increase by 30% during high humidity days. Proactive hydration alerts recommended.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SafetyAnalytics;