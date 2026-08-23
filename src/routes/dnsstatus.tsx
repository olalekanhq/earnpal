import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { CheckCircle2, Clock, RefreshCcw, ExternalLink, Globe, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export const Route = createFileRoute('/dnsstatus')({
  component: DnsStatusPage,
});

function DnsStatusPage() {
  const [status, setStatus] = useState<'loading' | 'pending' | 'propagated' | 'error'>('loading');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [progress, setProgress] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(25); // default 25s

  const checkDns = async () => {
    setStatus('loading');
    setProgress(20);
    try {
      const res = await fetch('/api/public/dns-check?domain=noblegain.qd.je');
      const data = await res.json();
      
      setProgress(100);
      const newStatus = data.status === 'propagated' ? 'propagated' : 'pending';
      setStatus(newStatus);
      setLastCheck(new Date());
      
      // Stop auto-refresh if propagated
      if (newStatus === 'propagated') {
        setAutoRefresh(false);
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  useEffect(() => {
    checkDns();
  }, []);

  useEffect(() => {
    if (!autoRefresh || status === 'propagated') return;

    const timer = setInterval(() => {
      checkDns();
    }, refreshInterval * 1000);
    
    return () => clearInterval(timer);
  }, [autoRefresh, refreshInterval, status]);

  return (
    <div className="container max-w-2xl py-24 px-4 space-y-8 animate-in fade-in duration-700">
      <div className="text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-primary">
          Domain Status
        </h1>
        <p className="text-muted-foreground font-medium">
          Tracking propagation for noblegain.qd.je
        </p>
      </div>

      <Card className="border-border/50 shadow-xl shadow-black/5 overflow-hidden">
        <div className={`h-2 w-full ${status === 'propagated' ? 'bg-green-500' : 'bg-primary/20'}`}>
          <div 
            className="h-full bg-primary transition-all duration-500" 
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold">CNAME Detection</CardTitle>
            <Badge variant={status === 'propagated' ? 'default' : 'secondary'} className="rounded-lg uppercase font-black text-[10px] px-3">
              {status}
            </Badge>
          </div>
          <CardDescription className="font-medium italic">
            Target: id-preview--6935d9db-d3e9-473c-9040-7c3d7835abcd.lovable.app
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/50">
              {status === 'propagated' ? (
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              ) : status === 'loading' ? (
                <RefreshCcw className="h-8 w-8 text-primary animate-spin" />
              ) : status === 'error' ? (
                <AlertCircle className="h-8 w-8 text-destructive" />
              ) : (
                <Clock className="h-8 w-8 text-primary animate-pulse" />
              )}
              
              <div className="flex-1">
                <p className="font-black text-sm uppercase">
                  {status === 'propagated' ? 'Site Reachable' : 'Propagation in Progress'}
                </p>
                <p className="text-xs text-muted-foreground font-medium">
                  {status === 'propagated' 
                    ? 'Your domain is now correctly pointed to the application.' 
                    : 'We are waiting for DNS servers worldwide to update their records.'}
                </p>
              </div>
            </div>

            {status !== 'propagated' && (
              <div className="flex items-center justify-between p-4 rounded-2xl bg-primary/5 border border-primary/10">
                <div className="space-y-0.5">
                  <p className="text-xs font-black uppercase tracking-widest text-primary">Auto Refresh</p>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase">Checking every {refreshInterval}s</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant={autoRefresh ? "default" : "outline"} 
                    size="sm"
                    className="h-8 rounded-lg font-black text-[10px] uppercase px-3"
                    onClick={() => setAutoRefresh(!autoRefresh)}
                  >
                    {autoRefresh ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">What to expect</h3>
            <ul className="text-sm space-y-2 font-medium">
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>Propagation typically takes <strong>15 minutes to 4 hours</strong>.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>In rare cases, it can take up to 24-48 hours.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>The site will automatically start working once detected.</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={checkDns} 
              disabled={status === 'loading'}
              className="flex-1 rounded-xl font-black uppercase h-12 shadow-lg shadow-primary/20"
            >
              <RefreshCcw className={`mr-2 h-4 w-4 ${status === 'loading' ? 'animate-spin' : ''}`} />
              Check Now
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 rounded-xl font-black uppercase h-12"
              asChild
            >
              <a href="https://whatsmydns.net/#CNAME/noblegain.qd.je" target="_blank" rel="noopener noreferrer">
                <Globe className="mr-2 h-4 w-4" />
                Global Check
                <ExternalLink className="ml-2 h-3 w-3" />
              </a>
            </Button>
          </div>
          
          {lastCheck && (
            <p className="text-[10px] text-center text-muted-foreground uppercase font-black tracking-widest pt-2">
              Last check: {lastCheck.toLocaleTimeString()}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="text-center">
        <Button variant="link" className="text-muted-foreground font-black uppercase text-xs tracking-widest" asChild>
          <a href="/">← Back to Landing</a>
        </Button>
      </div>
    </div>
  );
}
