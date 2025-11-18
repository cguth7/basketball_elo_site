"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const formSchema = z.object({
  winning_team: z.enum(["team_a", "team_b"], {
    required_error: "Please select the winning team",
  }),
  team_a_score: z.string().optional(),
  team_b_score: z.string().optional(),
}).refine((data) => {
  // If one score is provided, both must be provided
  const hasTeamAScore = data.team_a_score && data.team_a_score.length > 0
  const hasTeamBScore = data.team_b_score && data.team_b_score.length > 0

  if (hasTeamAScore || hasTeamBScore) {
    return hasTeamAScore && hasTeamBScore
  }
  return true
}, {
  message: "If you provide scores, both team scores are required",
  path: ["team_a_score"],
})

interface GameResultFormProps {
  gameId: string
  teamAName?: string
  teamBName?: string
  onSubmit: (data: {
    winning_team: "team_a" | "team_b"
    team_a_score?: number
    team_b_score?: number
  }) => Promise<void>
  isLoading?: boolean
}

export function GameResultForm({
  gameId,
  teamAName = "Team A",
  teamBName = "Team B",
  onSubmit,
  isLoading
}: GameResultFormProps) {
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false)
  const [pendingData, setPendingData] = React.useState<z.infer<typeof formSchema> | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      team_a_score: "",
      team_b_score: "",
    },
  })

  const handleFormSubmit = (values: z.infer<typeof formSchema>) => {
    setPendingData(values)
    setShowConfirmDialog(true)
  }

  const handleConfirm = async () => {
    if (!pendingData) return

    const data = {
      winning_team: pendingData.winning_team,
      team_a_score: pendingData.team_a_score ? parseInt(pendingData.team_a_score) : undefined,
      team_b_score: pendingData.team_b_score ? parseInt(pendingData.team_b_score) : undefined,
    }

    await onSubmit(data)
    setShowConfirmDialog(false)
    setPendingData(null)
    form.reset()
  }

  const selectedWinner = form.watch("winning_team")

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="winning_team"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Winning Team</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select the winning team" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="team_a">{teamAName}</SelectItem>
                    <SelectItem value="team_b">{teamBName}</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select which team won the game.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <div className="text-sm font-medium">
              Scores (Optional)
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="team_a_score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{teamAName} Score</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        min="0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="team_b_score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{teamBName} Score</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        min="0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Scores are optional but help track game history.
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Submitting..." : "Submit Result"}
          </Button>
        </form>
      </Form>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Game Result</DialogTitle>
            <DialogDescription>
              Please confirm the game result. ELO ratings will be updated for all players.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Winner:</span>
                <span className="font-bold text-green-600">
                  {selectedWinner === "team_a" ? teamAName : teamBName}
                </span>
              </div>
              {pendingData?.team_a_score && pendingData?.team_b_score && (
                <div className="flex items-center justify-center gap-4 pt-2 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{pendingData.team_a_score}</div>
                    <div className="text-xs text-muted-foreground">{teamAName}</div>
                  </div>
                  <div className="text-xl font-bold text-muted-foreground">-</div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{pendingData.team_b_score}</div>
                    <div className="text-xs text-muted-foreground">{teamBName}</div>
                  </div>
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              This action cannot be undone. Make sure the result is correct before confirming.
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirmDialog(false)
                setPendingData(null)
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={isLoading}>
              {isLoading ? "Submitting..." : "Confirm Result"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
