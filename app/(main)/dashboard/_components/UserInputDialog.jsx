import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from '@/components/ui/textarea'
import { aiExpertList } from '@/services/Options'
import Image from 'next/image'
import { useStackApp } from '@stackframe/stack'
import { Button } from '@/components/ui/button'
import { DialogClose } from '@radix-ui/react-dialog'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api' //  Make sure this path is correct
import { LoaderCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'


function UserInputDialog({ children, ExpertList }) {
  const [selectedExpert, setSelectedExpert] = useState(null)
  const [topic, setTopic] = useState("")
  const [loading, setLoading] = useState(false)
  const [openDialog,setOpenDialog]=useState(false)
  const router =useRouter();

  const createDiscussion = useMutation(api.DiscussionRoom.CreateNewRoom)

  const onClickNext = async () => {
    setLoading(true)
    try {
      const result = await createDiscussion({
        topic,
        aiExpertList: ExpertList.name, // ✅ Use the prop passed, not the array
        expertName: selectedExpert,
      })
      console.log("Created Room ID:", result)
      router.push('/discussion-room/'+result)
    } catch (error) {
      console.error("Failed to create room", error)
    } finally {
      setLoading(false)
    }
    setOpenDialog(false);
    
  }

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{ExpertList.name}</DialogTitle>
          <DialogDescription asChild>
            <div className='mt-3'>
              <h2 className='text-black'>
                Enter a topic to master your skills in {ExpertList.name}
              </h2>
              <Textarea
                placeholder="Enter your topic here..."
                className='mt-2'
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />

              <h2 className='text-black mt-5'>Select an Expert</h2>
              <div className='grid grid-cols-3 md:grid-cols-5 gap-6 mt-3'>
                {aiExpertList.map((expert, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedExpert(expert.name)}
                    className={`p-1 rounded-2xl cursor-pointer transition-all ${
                      selectedExpert === expert.name ? 'border-2 border-blue-500' : ''
                    }`}
                  >
                    <Image
                      src={expert.avatar}
                      alt={expert.name}
                      width={80}
                      height={80}
                      className='rounded-2xl object-cover hover:scale-110 transition-transform'
                    />
                    <h2 className='text-center mt-2 text-sm'>{expert.name}</h2>
                  </div>
                ))}
              </div>

              <div className='flex gap-5 justify-end mt-5'>
                <DialogClose asChild>
                  <Button variant={'ghost'}>Cancel</Button>
                </DialogClose>

                <Button
                  disabled={!topic || !selectedExpert || loading}
                  onClick={onClickNext}
                >
                  {loading ? (
                    <LoaderCircle className='animate-spin w-4 h-4 mr-2' />
                  ) : null}
                  Next
                </Button>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

export default UserInputDialog
