"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, CheckCircle, ExternalLink, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/integrations/supabase/client"

interface MigrationCheckerProps {
  onMigrationComplete?: () => void
}

const MIGRATION_SQL = `
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS is_trimmed BOOLEAN DEFAULT false;
`.trim()

export const MigrationChecker: React.FC<MigrationCheckerProps> = ({ onMigrationComplete }) => {
  const [status, setStatus] = useState<'checking' | 'exists' | 'missing' | 'error'>('checking')
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    checkColumn()
  }, [retryCount])

  const checkColumn = async () => {
    setStatus('checking')
    setError(null)

    try {
      const { error: selectError } = await supabase
        .from('expenses')
        .select('is_trimmed')
        .limit(1)
        .maybeSingle()

      if (selectError) {
        // Check if error is about missing column or something else
        if (selectError.message.includes('is_trimmed') || selectError.code === 'PGRST204') {
          setStatus('missing')
        } else {
          setStatus('error')
          setError(selectError.message)
        }
      } else {
        setStatus('exists')
        onMigrationComplete?.()
      }
    } catch (err: any) {
      setStatus('error')
      setError(err.message)
    }
  }

  const openSupabaseSQL = () => {
    // This would need the actual Supabase project URL
    // For now, we'll show a helpful message
    window.open('https://supabase.com/dashboard', '_blank')
  }

  const copySQL = () => {
    navigator.clipboard.writeText(MIGRATION_SQL)
  }

  if (status === 'checking') {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-6 flex items-center gap-4">
          <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
          <div>
            <p className="text-white font-medium">Verificando base de datos...</p>
            <p className="text-zinc-400 text-sm">Comprobando columna is_trimmed</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (status === 'exists') {
    return (
      <Card className="bg-green-900/20 border-green-800">
        <CardContent className="p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <p className="text-green-300 text-sm">
            ✓ Base de datos actualizada correctamente
          </p>
        </CardContent>
      </Card>
    )
  }

  if (status === 'error') {
    return (
      <Card className="bg-red-900/20 border-red-800">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <p className="text-red-300 text-sm font-medium">Error al verificar la base de datos</p>
          </div>
          <p className="text-zinc-400 text-xs">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setRetryCount(c => c + 1)}
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            Reintentar
          </Button>
        </CardContent>
      </Card>
    )
  }

  // status === 'missing'
  return (
    <Card className="bg-amber-900/20 border-amber-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-amber-300 text-base flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Se requiere actualización de base de datos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-zinc-300 text-sm">
          La columna <code className="bg-zinc-800 px-1 py-0.5 rounded text-amber-400">is_trimmed</code> no existe en la tabla de gastos. 
          Para usar la función de "recortar" suscripciones, necesitas ejecutar una migración.
        </p>

        <div className="space-y-2">
          <p className="text-zinc-400 text-xs font-medium">SQL a ejecutar:</p>
          <div className="bg-zinc-950 border border-zinc-700 rounded-lg p-3 relative group">
            <pre className="text-green-400 text-xs overflow-x-auto">
              <code>{MIGRATION_SQL}</code>
            </pre>
            <Button
              variant="ghost"
              size="sm"
              onClick={copySQL}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-xs"
            >
              Copiar
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-zinc-400 text-xs font-medium">Pasos:</p>
          <ol className="text-zinc-300 text-xs space-y-1 list-decimal list-inside">
            <li>Abre tu proyecto en <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">Supabase Dashboard</a></li>
            <li>Ve a <strong>SQL Editor</strong></li>
            <li>Pega y ejecuta el SQL de arriba</li>
            <li>Actualiza esta página</li>
          </ol>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={openSupabaseSQL}
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-black"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Abrir Supabase
          </Button>
          <Button 
            variant="outline"
            onClick={() => setRetryCount(c => c + 1)}
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Verificar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default MigrationChecker