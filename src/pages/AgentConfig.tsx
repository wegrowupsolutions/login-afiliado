import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, RotateCcw, Settings, HelpCircle, CheckCircle, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const formSchema = z.object({
  // Contexto
  context: z.object({
    scenario: z.string().min(10, 'Descreva o cenário com pelo menos 10 caracteres'),
    problem: z.string().min(10, 'Descreva o problema com pelo menos 10 caracteres'),
    expectedResult: z.string().min(10, 'Descreva o resultado esperado'),
    targetAudience: z.string().min(5, 'Defina o público-alvo'),
    environment: z.string().min(5, 'Descreva o ambiente/situação'),
  }),
  
  // Personalidade
  personality: z.object({
    toneOfVoice: z.string().min(5, 'Defina o tom de voz'),
    languageLevel: z.string().min(5, 'Defina o nível de linguagem'),
    characteristics: z.string().min(10, 'Descreva as características de personalidade'),
    specificKnowledge: z.string().min(10, 'Liste os conhecimentos específicos necessários'),
  }),
  
  // Diretrizes
  guidelines: z.object({
    policies: z.string().min(10, 'Liste as políticas importantes'),
    actionLimits: z.string().min(10, 'Defina os limites de atuação'),
    restrictions: z.string().min(10, 'Liste as restrições legais ou éticas'),
    procedures: z.string().min(10, 'Descreva os procedimentos obrigatórios'),
    confidentialInfo: z.string().optional(),
  }),
  
  // Estrutura da Conversa
  conversationStructure: z.string().min(20, 'Detalhe o passo a passo do raciocínio'),
  
  // FAQ
  faq: z.string().min(20, 'Liste as perguntas e respostas frequentes'),
  
  // Exemplos de Uso
  usageExamples: z.string().min(20, 'Forneça exemplos práticos de interações'),
  
  // Métricas de Sucesso
  successMetrics: z.object({
    qualityIndicators: z.string().min(10, 'Defina os indicadores de qualidade'),
    performanceMetrics: z.string().min(10, 'Liste as métricas de desempenho'),
    evaluationCriteria: z.string().min(10, 'Descreva os critérios de avaliação'),
  }),

  // Links de Divulgação
  promotionLinks: z.array(z.string().url('Deve ser uma URL válida')).min(1, 'Pelo menos um link é obrigatório'),

  // Nome do Produto
  productName: z.string().min(2, 'Nome do produto deve ter pelo menos 2 caracteres'),
});

type FormData = z.infer<typeof formSchema>;

const AgentConfig = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openSections, setOpenSections] = useState(['context']);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      context: {
        scenario: '',
        problem: '',
        expectedResult: '',
        targetAudience: '',
        environment: '',
      },
      personality: {
        toneOfVoice: '',
        languageLevel: '',
        characteristics: '',
        specificKnowledge: '',
      },
      guidelines: {
        policies: '',
        actionLimits: '',
        restrictions: '',
        procedures: '',
        confidentialInfo: '',
      },
      conversationStructure: '',
      faq: '',
      usageExamples: '',
      successMetrics: {
        qualityIndicators: '',
        performanceMetrics: '',
        evaluationCriteria: '',
      },
      promotionLinks: [''],
      productName: '',
    },
  });
  
  const addPromotionLink = () => {
    const currentLinks = form.getValues('promotionLinks') || [];
    form.setValue('promotionLinks', [...currentLinks, '']);
  };

  const removePromotionLink = (index: number) => {
    const currentLinks = form.getValues('promotionLinks') || [];
    if (currentLinks.length > 1) {
      const newLinks = currentLinks.filter((_, i) => i !== index);
      form.setValue('promotionLinks', newLinks);
    }
  };
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      // Simular salvamento - implementar API aqui
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Configuração do agente:', data);
      toast.success('Configuração do agente salva com sucesso!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Erro ao salvar configuração. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    form.reset();
    toast.info('Formulário resetado');
  };

  const completedSections = React.useMemo(() => {
    const values = form.watch();
    const sections = [
      { key: 'context', check: Object.values(values.context || {}).some(v => v.length > 0) },
      { key: 'personality', check: Object.values(values.personality || {}).some(v => v.length > 0) },
      { key: 'guidelines', check: Object.values(values.guidelines || {}).some(v => v.length > 0) },
      { key: 'conversationStructure', check: (values.conversationStructure || '').length > 0 },
      { key: 'faq', check: (values.faq || '').length > 0 },
      { key: 'usageExamples', check: (values.usageExamples || '').length > 0 },
      { key: 'successMetrics', check: Object.values(values.successMetrics || {}).some(v => v.length > 0) },
      { key: 'promotionLinks', check: (values.promotionLinks || []).some(link => link.length > 0) },
      { key: 'productName', check: (values.productName || '').length > 0 },
    ];
    return sections.filter(section => section.check).length;
  }, [form.watch()]);

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/dashboard')}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Voltar
              </Button>
              <div className="h-6 w-px bg-border" />
              <Settings className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold tracking-tight">Configuração do Agente</h1>
            </div>
            <p className="text-muted-foreground">
              Configure e personalize seu agente IA para atender suas necessidades específicas
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/10 text-primary">
              {completedSections}/9 seções preenchidas
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Progress Indicator */}
        <Card className="border-primary/20">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Progresso da Configuração</CardTitle>
              </div>
              <span className="text-sm text-muted-foreground">
                {Math.round((completedSections / 9) * 100)}% completo
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500"
                style={{ width: `${(completedSections / 9) * 100}%` }}
              />
            </div>
          </CardHeader>
        </Card>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <Accordion 
                  type="multiple" 
                  value={openSections}
                  onValueChange={setOpenSections}
                  className="space-y-4"
                >
                  {/* 1. CONTEXTO */}
                  <AccordionItem value="context" className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 text-left">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">1</span>
                        </div>
                        <div>
                          <h3 className="font-semibold">Contexto</h3>
                          <p className="text-sm text-muted-foreground">Defina o cenário e objetivo do agente</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <FormField
                        control={form.control}
                        name="context.scenario"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cenário Específico</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Descreva aqui o cenário específico onde o agente será utilizado..."
                                {...field}
                                rows={3}
                              />
                            </FormControl>
                            <FormDescription>
                              Contextualize o ambiente onde o agente vai atuar
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="context.problem"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Problema a ser Resolvido</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Qual é o problema que precisa ser resolvido?"
                                {...field}
                                rows={3}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="context.expectedResult"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Resultado Esperado</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Qual é o resultado esperado?"
                                  {...field}
                                  rows={3}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="context.targetAudience"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Público-Alvo</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Quem é o público-alvo?"
                                  {...field}
                                  rows={3}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="context.environment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ambiente/Situação</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Em qual ambiente/situação será utilizado?"
                                {...field}
                                rows={2}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem>

                  {/* 2. PERSONALIDADE */}
                  <AccordionItem value="personality" className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 text-left">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">2</span>
                        </div>
                        <div>
                          <h3 className="font-semibold">Personalidade</h3>
                          <p className="text-sm text-muted-foreground">Configure o comportamento e características</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="personality.toneOfVoice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tom de Voz</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Ex: formal, informal, amigável, profissional"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Como o agente deve se comunicar
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="personality.languageLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nível de Linguagem</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Ex: técnico, simples, acadêmico, coloquial"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="personality.characteristics"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Características de Personalidade</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Descreva as características específicas de personalidade que o agente deve ter..."
                                {...field}
                                rows={3}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="personality.specificKnowledge"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Conhecimentos Específicos</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Liste os conhecimentos específicos necessários para o agente..."
                                {...field}
                                rows={3}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem>

                  {/* 3. DIRETRIZES */}
                  <AccordionItem value="guidelines" className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 text-left">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">3</span>
                        </div>
                        <div>
                          <h3 className="font-semibold">Diretrizes</h3>
                          <p className="text-sm text-muted-foreground">Regras e restrições do negócio</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <FormField
                        control={form.control}
                        name="guidelines.policies"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Políticas Importantes</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Liste as políticas importantes que o agente deve seguir..."
                                {...field}
                                rows={3}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="guidelines.actionLimits"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Limites de Atuação</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Defina os limites de atuação do agente..."
                                  {...field}
                                  rows={3}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="guidelines.restrictions"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Restrições Legais ou Éticas</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Liste as restrições legais ou éticas..."
                                  {...field}
                                  rows={3}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="guidelines.procedures"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Procedimentos Obrigatórios</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Descreva os procedimentos obrigatórios que o agente deve seguir..."
                                {...field}
                                rows={3}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="guidelines.confidentialInfo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Informações Confidenciais ou Sensíveis (Opcional)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Liste informações que o agente deve tratar com confidencialidade..."
                                {...field}
                                rows={2}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem>

                  {/* 4. ESTRUTURA DA CONVERSA */}
                  <AccordionItem value="conversationStructure" className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 text-left">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">4</span>
                        </div>
                        <div>
                          <h3 className="font-semibold">Estrutura da Conversa</h3>
                          <p className="text-sm text-muted-foreground">Passo a passo do raciocínio</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <FormField
                        control={form.control}
                        name="conversationStructure"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Passo a Passo do Raciocínio</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Detalhe o passo a passo do raciocínio do agente:

1. Primeiro passo
   - Subtarefas
   - Considerações importantes

2. Segundo passo
   - Subtarefas
   - Considerações importantes

[Continue com os passos necessários]"
                                {...field}
                                rows={10}
                              />
                            </FormControl>
                            <FormDescription>
                              Defina como o agente deve estruturar suas respostas e raciocínio
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem>

                  {/* 5. FAQ */}
                  <AccordionItem value="faq" className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 text-left">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">5</span>
                        </div>
                        <div>
                          <h3 className="font-semibold">FAQ</h3>
                          <p className="text-sm text-muted-foreground">Perguntas frequentes e respostas</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <FormField
                        control={form.control}
                        name="faq"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Perguntas e Respostas Frequentes</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Liste as perguntas frequentes e suas respostas:

P1: [Pergunta frequente 1]
R1: [Resposta detalhada]

P2: [Pergunta frequente 2]
R2: [Resposta detalhada]

[Continue com mais perguntas relevantes]"
                                {...field}
                                rows={8}
                              />
                            </FormControl>
                            <FormDescription>
                              Inclua as perguntas mais comuns que os usuários podem fazer
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem>

                  {/* 6. EXEMPLOS DE USO */}
                  <AccordionItem value="usageExamples" className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 text-left">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">6</span>
                        </div>
                        <div>
                          <h3 className="font-semibold">Exemplos de Uso</h3>
                          <p className="text-sm text-muted-foreground">Interações práticas e modelos</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <FormField
                        control={form.control}
                        name="usageExamples"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Exemplos Práticos de Interações</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Forneça exemplos práticos de interações:

Exemplo 1:
- Situação: [Descreva a situação]
- Diálogo modelo: [Mostre a conversa]
- Resultado esperado: [O que deve acontecer]

Exemplo 2:
- Situação: [Descreva a situação]
- Diálogo modelo: [Mostre a conversa]
- Resultado esperado: [O que deve acontecer]"
                                {...field}
                                rows={10}
                              />
                            </FormControl>
                            <FormDescription>
                              Demonstre como o agente deve se comportar em situações específicas
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem>

                  {/* 7. MÉTRICAS DE SUCESSO */}
                  <AccordionItem value="successMetrics" className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 text-left">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">7</span>
                        </div>
                        <div>
                          <h3 className="font-semibold">Métricas de Sucesso</h3>
                          <p className="text-sm text-muted-foreground">Como medir o desempenho</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <FormField
                        control={form.control}
                        name="successMetrics.qualityIndicators"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Indicadores de Qualidade</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Defina os indicadores de qualidade para avaliar o desempenho do agente..."
                                {...field}
                                rows={3}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="successMetrics.performanceMetrics"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Métricas de Desempenho</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Liste as métricas de desempenho (tempo de resposta, precisão, etc.)..."
                                {...field}
                                rows={3}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="successMetrics.evaluationCriteria"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Critérios de Avaliação</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Descreva os critérios de avaliação para determinar o sucesso..."
                                {...field}
                                rows={3}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem>

                  {/* 8. LINKS DE DIVULGAÇÃO */}
                  <AccordionItem value="promotionLinks" className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 text-left">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">8</span>
                        </div>
                        <div>
                          <h3 className="font-semibold">Links de Divulgação</h3>
                          <p className="text-sm text-muted-foreground">Links para divulgação do produto</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div className="space-y-3">
                        {form.watch('promotionLinks')?.map((link, index) => (
                          <div key={index} className="flex items-end gap-2">
                            <FormField
                              control={form.control}
                              name={`promotionLinks.${index}`}
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormLabel>
                                    Link {index + 1} 
                                    {index === 0 && <span className="text-destructive ml-1">*</span>}
                                  </FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="https://exemplo.com"
                                      {...field}
                                    />
                                  </FormControl>
                                  {index === 0 && (
                                    <FormDescription>
                                      Link principal obrigatório
                                    </FormDescription>
                                  )}
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            {index > 0 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removePromotionLink(index)}
                                className="mb-2 text-destructive hover:text-destructive"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addPromotionLink}
                          className="w-full border-dashed"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar novo link
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* 9. NOME DO PRODUTO */}
                  <AccordionItem value="productName" className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 text-left">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">9</span>
                        </div>
                        <div>
                          <h3 className="font-semibold">Nome do Produto</h3>
                          <p className="text-sm text-muted-foreground">Identifique seu produto ou serviço</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <FormField
                        control={form.control}
                        name="productName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome do Produto ou Serviço</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Digite o nome do seu produto ou serviço"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Nome que será usado pelo agente para se referir ao seu produto
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card className="border-primary/20">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-3 justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Resetar Formulário
                  </Button>
                  
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/dashboard')}
                    >
                      Cancelar
                    </Button>
                    
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white min-w-[140px]"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Salvando...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Save className="h-4 w-4" />
                          Salvar Configuração
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </Form>
      </div>
    </AppLayout>
  );
};

export default AgentConfig;