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

const formSchema = z.object({
  team_size: z.string().min(1, "Please select a team size"),
})

interface CreateGameFormProps {
  onSubmit: (data: { team_size: number }) => Promise<void>
  isLoading?: boolean
}

export function CreateGameForm({ onSubmit, isLoading }: CreateGameFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      team_size: "5",
    },
  })

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    await onSubmit({ team_size: parseInt(values.team_size) })
    form.reset()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="team_size"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Team Size</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team size" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="3">3v3</SelectItem>
                  <SelectItem value="4">4v4</SelectItem>
                  <SelectItem value="5">5v5 (Full Court)</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Choose the number of players per team for this game.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Game"}
        </Button>
      </form>
    </Form>
  )
}
