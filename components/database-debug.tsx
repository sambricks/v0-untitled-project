"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DatabaseDebug() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tables, setTables] = useState<string[]>([])
  const [selectedTable, setSelectedTable] = useState<string>("")
  const [tableData, setTableData] = useState<any[]>([])
  const [tableColumns, setTableColumns] = useState<string[]>([])
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    async function fetchTables() {
      try {
        setLoading(true)
        setError(null)

        // Get list of tables
        const { data, error } = await supabase.rpc("get_tables")

        if (error) throw error

        const tableNames = data.map((t: any) => t.table_name)
        setTables(tableNames)

        if (tableNames.length > 0) {
          setSelectedTable(tableNames[0])
          await fetchTableData(tableNames[0])
        }
      } catch (error) {
        console.error("Error fetching tables:", error)
        setError(`Failed to fetch tables: ${error instanceof Error ? error.message : String(error)}`)
      } finally {
        setLoading(false)
      }
    }

    fetchTables()
  }, [supabase])

  const fetchTableData = async (tableName: string) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase.from(tableName).select("*").limit(10)

      if (error) throw error

      setTableData(data || [])

      // Extract column names from the first row
      if (data && data.length > 0) {
        setTableColumns(Object.keys(data[0]))
      } else {
        setTableColumns([])
      }

      setSelectedTable(tableName)
    } catch (error) {
      console.error(`Error fetching data from ${tableName}:`, error)
      setError(`Failed to fetch data: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  // Fallback if get_tables RPC doesn't exist
  const checkCommonTables = async () => {
    try {
      setLoading(true)
      setError(null)

      const commonTables = [
        "user_profiles",
        "mood_entries",
        "journal_entries",
        "chat_messages",
        "music_recommendations",
      ]

      const existingTables = []

      for (const table of commonTables) {
        try {
          const { data, error } = await supabase.from(table).select("count(*)").limit(1)

          if (!error) {
            existingTables.push(table)
          }
        } catch (e) {
          // Skip tables that don't exist
        }
      }

      setTables(existingTables)

      if (existingTables.length > 0) {
        setSelectedTable(existingTables[0])
        await fetchTableData(existingTables[0])
      }
    } catch (error) {
      console.error("Error checking common tables:", error)
      setError(`Failed to check tables: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Database Explorer</CardTitle>
        <CardDescription>View the contents of your database tables</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading && tables.length === 0 ? (
          <p>Loading tables...</p>
        ) : tables.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4">No tables found or unable to access tables</p>
            <Button onClick={checkCommonTables}>Check Common Tables</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Tabs value={selectedTable} onValueChange={(value) => fetchTableData(value)}>
              <TabsList className="w-full flex overflow-x-auto">
                {tables.map((table) => (
                  <TabsTrigger key={table} value={table} className="flex-1">
                    {table}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={selectedTable} className="mt-4">
                {loading ? (
                  <p>Loading data...</p>
                ) : tableData.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">No data in this table</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-muted">
                          {tableColumns.map((column) => (
                            <th key={column} className="p-2 text-left text-xs font-medium text-muted-foreground">
                              {column}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {tableData.map((row, i) => (
                          <tr key={i} className="border-b border-muted">
                            {tableColumns.map((column) => (
                              <td key={column} className="p-2 text-xs">
                                {typeof row[column] === "object"
                                  ? JSON.stringify(row[column])
                                  : String(row[column] ?? "")}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          onClick={() => fetchTableData(selectedTable)}
          disabled={loading || !selectedTable}
          className="w-full"
        >
          Refresh Data
        </Button>
      </CardFooter>
    </Card>
  )
}
