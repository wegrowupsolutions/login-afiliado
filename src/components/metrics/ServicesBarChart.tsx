
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from 'recharts';

interface FunnelStage {
  name: string;
  value: number;
  color: string;
}

interface ConversationFunnelProps {
  data?: FunnelStage[];
}

const ConversationFunnel: React.FC<ConversationFunnelProps> = ({ data }) => {
  // Default funnel data
  const defaultData: FunnelStage[] = [
    { name: "Iniciaram Conversa", value: 450, color: "#10B981" },
    { name: "+10 Mensagens", value: 320, color: "#3B82F6" },
    { name: "Pediram Link", value: 180, color: "#8B5CF6" }
  ];

  const funnelData = data || defaultData;
  
  // Calculate conversion rates
  const baseValue = funnelData[0]?.value || 1;
  const conversationRate = Math.round((funnelData[1]?.value / baseValue) * 100);
  const linkRequestRate = Math.round((funnelData[2]?.value / baseValue) * 100);

  return (
    <Card className="dark:bg-gray-800 transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
          <TrendingDown className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          Funil de Conversa
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Conversion rates display */}
          <div className="flex justify-center gap-6 text-sm">
            <div className="text-center">
              <div className="font-semibold text-blue-600 dark:text-blue-400">
                {conversationRate}%
              </div>
              <div className="text-muted-foreground">
                Taxa de Engajamento
              </div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-purple-600 dark:text-purple-400">
                {linkRequestRate}%
              </div>
              <div className="text-muted-foreground">
                Taxa de Conversão
              </div>
            </div>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={funnelData}
                margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12 }} 
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    border: "none",
                  }}
                  formatter={(value, name) => [value, "Pessoas"]}
                />
                <Bar dataKey="value" name="Pessoas" radius={[4, 4, 0, 0]}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversationFunnel;
