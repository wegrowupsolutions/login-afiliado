import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Mapeamento DDD para Estados
const dddToState: { [key: string]: string } = {
  '11': 'SP', '12': 'SP', '13': 'SP', '14': 'SP', '15': 'SP', '16': 'SP', '17': 'SP', '18': 'SP', '19': 'SP',
  '21': 'RJ', '22': 'RJ', '24': 'RJ',
  '27': 'ES', '28': 'ES',
  '31': 'MG', '32': 'MG', '33': 'MG', '34': 'MG', '35': 'MG', '37': 'MG', '38': 'MG',
  '41': 'PR', '42': 'PR', '43': 'PR', '44': 'PR', '45': 'PR', '46': 'PR',
  '47': 'SC', '48': 'SC', '49': 'SC',
  '51': 'RS', '53': 'RS', '54': 'RS', '55': 'RS',
  '61': 'DF', '62': 'GO', '64': 'GO',
  '63': 'TO', '65': 'MT', '66': 'MT', '67': 'MS',
  '68': 'AC', '69': 'RO',
  '71': 'BA', '73': 'BA', '74': 'BA', '75': 'BA', '77': 'BA',
  '79': 'SE', '81': 'PE', '87': 'PE',
  '82': 'AL', '83': 'PB', '84': 'RN', '85': 'CE', '88': 'CE',
  '86': 'PI', '89': 'PI', '91': 'PA', '93': 'PA', '94': 'PA',
  '92': 'AM', '97': 'AM', '95': 'RR', '96': 'AP', '98': 'MA', '99': 'MA'
};

const stateNames: { [key: string]: string } = {
  'SP': 'São Paulo', 'RJ': 'Rio de Janeiro', 'MG': 'Minas Gerais', 'ES': 'Espírito Santo',
  'PR': 'Paraná', 'SC': 'Santa Catarina', 'RS': 'Rio Grande do Sul',
  'DF': 'Distrito Federal', 'GO': 'Goiás', 'TO': 'Tocantins', 'MT': 'Mato Grosso', 'MS': 'Mato Grosso do Sul',
  'BA': 'Bahia', 'SE': 'Sergipe', 'AL': 'Alagoas', 'PE': 'Pernambuco', 'PB': 'Paraíba', 'RN': 'Rio Grande do Norte',
  'CE': 'Ceará', 'PI': 'Piauí', 'MA': 'Maranhão', 'PA': 'Pará', 'AP': 'Amapá', 'AM': 'Amazonas',
  'RR': 'Roraima', 'AC': 'Acre', 'RO': 'Rondônia'
};

interface StateData {
  id: string;
  name: string;
  clients: number;
}

interface PetTypesChartProps {
  data?: any[];
  loading?: boolean;
}

const BrazilMap: React.FC<PetTypesChartProps> = ({ loading }) => {
  const [statesData, setStatesData] = useState<StateData[]>([]);
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchClientsByState = async () => {
      try {
        const { data: clientes, error } = await supabase
          .from('dados_cliente')
          .select('telefone')
          .not('telefone', 'is', null);

        if (error) throw error;

        const stateCounts: { [key: string]: number } = {};

        clientes?.forEach((cliente) => {
          if (cliente.telefone) {
            // Extrair DDD do telefone (primeiros 2 dígitos após o código do país)
            const phone = cliente.telefone.replace(/\D/g, '');
            let ddd = '';
            
            if (phone.length >= 10) {
              // Se tem código do país (55), pega os próximos 2 dígitos
              if (phone.startsWith('55')) {
                ddd = phone.substring(2, 4);
              } else {
                // Senão, pega os primeiros 2 dígitos
                ddd = phone.substring(0, 2);
              }
            }

            const state = dddToState[ddd];
            if (state) {
              stateCounts[state] = (stateCounts[state] || 0) + 1;
            }
          }
        });

        const statesArray = Object.entries(stateCounts).map(([id, clients]) => ({
          id,
          name: stateNames[id] || id,
          clients
        }));

        setStatesData(statesArray);
      } catch (error) {
        console.error('Erro ao buscar dados dos clientes:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados dos estados.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientsByState();
  }, [toast]);

  const maxClients = Math.max(...statesData.map(s => s.clients), 1);
  
  const getStateColor = (stateId: string) => {
    const state = statesData.find(s => s.id === stateId);
    if (!state) return '#f3f4f6';
    
    const intensity = state.clients / maxClients;
    const opacity = Math.max(0.2, intensity);
    return `rgba(139, 92, 246, ${opacity})`;
  };

  const getStateClients = (stateId: string) => {
    const state = statesData.find(s => s.id === stateId);
    return state ? state.clients : 0;
  };

  // URL para o GeoJSON do Brasil
  const brazilGeoJsonUrl = "https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson";

  return (
    <Card className="dark:bg-gray-800 transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
          <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          Clientes por Estado
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[32rem]">
          {isLoading || loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Carregando mapa...</p>
              </div>
            </div>
          ) : (
            <div className="relative">
              <ComposableMap
                projection="geoMercator"
                projectionConfig={{
                  center: [-52, -14],
                  scale: 650
                }}
                width={800}
                height={400}
                style={{ width: '100%', height: '100%' }}
              >
                <ZoomableGroup>
                  <Geographies geography={brazilGeoJsonUrl}>
                    {({ geographies }) =>
                      geographies.map((geo) => {
                        const stateId = geo.properties.sigla || geo.properties.SIGLA || geo.properties.name || geo.id;
                        const clients = getStateClients(stateId);
                        
                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            fill={getStateColor(stateId)}
                            stroke="#374151"
                            strokeWidth={0.75}
                            style={{
                              default: { 
                                outline: 'none',
                                transition: 'all 0.2s ease-in-out'
                              },
                              hover: { 
                                outline: 'none',
                                fill: `${getStateColor(stateId)}DD`,
                                stroke: '#8B5CF6',
                                strokeWidth: 1.5,
                                cursor: 'pointer'
                              },
                              pressed: { outline: 'none' }
                            }}
                            onMouseEnter={() => setHoveredState(stateId)}
                            onMouseLeave={() => setHoveredState(null)}
                          />
                        );
                      })
                    }
                  </Geographies>
                </ZoomableGroup>
              </ComposableMap>
              
              {hoveredState && (
                <div className="absolute top-2 left-2 bg-white dark:bg-gray-800 p-2 rounded shadow-lg border">
                  <p className="font-semibold">{stateNames[hoveredState] || hoveredState}</p>
                  <p className="text-sm text-muted-foreground">
                    {getStateClients(hoveredState)} cliente(s)
                  </p>
                </div>
              )}
              
              <div className="absolute bottom-2 right-2 bg-white dark:bg-gray-800 p-2 rounded shadow-lg border">
                <p className="text-xs font-semibold mb-1">Legenda:</p>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 bg-gray-200 rounded"></div>
                  <span>0 clientes</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: 'rgba(139, 92, 246, 1)' }}></div>
                  <span>Mais clientes</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {!isLoading && !loading && statesData.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold mb-2">Top 5 Estados:</h4>
            <div className="space-y-1">
              {statesData
                .sort((a, b) => b.clients - a.clients)
                .slice(0, 5)
                .map((state, index) => (
                  <div key={state.id} className="flex justify-between text-sm">
                    <span>{index + 1}. {state.name}</span>
                    <span className="font-semibold">{state.clients} cliente(s)</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BrazilMap;