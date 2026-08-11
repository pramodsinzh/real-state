import { Button } from "@/components/ui/button";
import { useGetAuthUserQuery } from "@/state/api";
import { Phone, Globe, Clock } from "lucide-react";
import { useRouter } from "next/navigation"; 


const ContactWidget = ({ onOpenModal }: ContactWidgetProps) => {
  const { data: authUser } = useGetAuthUserQuery();
  const router = useRouter();

  const handleButtonClick = () => {
    if (authUser) {
      onOpenModal();
    } else {
      router.push("/signin");
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 h-fit min-w-[300px] shadow-sm">
      {/* Contact Property */}
      <div className="flex items-center gap-4 mb-5 border border-gray-200 p-4 rounded-xl">
        <div className="flex items-center justify-center w-11 h-11 shrink-0 bg-gray-900 rounded-full">
          <Phone className="text-white" size={16} />
        </div>
        <div>
          <p className="text-xs text-gray-500">Contact This Property</p>
          {/* TODO: hardcoded placeholder — wire up manager's real phone number once available on the property/manager data */}
          <div className="text-lg font-bold text-gray-900">
            (424) 340-5574
          </div>
        </div>
      </div>

      <Button
        className="w-full bg-gray-900 text-white hover:bg-secondary-500 transition-colors duration-300 rounded-full"
        onClick={handleButtonClick}
      >
        {authUser ? "Submit Application" : "Sign In to Apply"}
      </Button>

      <div className="h-px bg-gray-100 my-5" />

      <div className="space-y-2.5 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-gray-400 shrink-0" />
          <span>Languages: English, Bahasa</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400 shrink-0" />
          <span>Open by appointment, Mon – Sun</span>
        </div>
      </div>
    </div>
  );
};

export default ContactWidget;