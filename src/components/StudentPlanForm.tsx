import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Send, FileText } from "lucide-react";

interface FormData {
  studentName: string;
  group: string;
  planType: string;
  planElement: string;
  day1: string;
  day2: string;
  startDay: string;
  startMonth: string;
  startYear: string;
  planDays: string;
}

interface N8nConfig {
  webhookUrl: string;
  dataWebhookUrl: string;
}

const StudentPlanForm = () => {
  const [formData, setFormData] = useState<FormData>({
    studentName: "",
    group: "",
    planType: "",
    planElement: "",
    day1: "",
    day2: "",
    startDay: "",
    startMonth: "",
    startYear: "",
    planDays: "",
  });

  const [n8nConfig, setN8nConfig] = useState<N8nConfig>({
    webhookUrl: "",
    dataWebhookUrl: "",
  });

  const [groups, setGroups] = useState<string[]>([]);
  const [planTypes, setPlanTypes] = useState<string[]>([]);
  const [planElements, setPlanElements] = useState<string[]>([]);
  const [days] = useState<string[]>([
    "السبت",
    "الأحد",
    "الإثنين",
    "الثلاثاء",
    "الأربعاء",
    "الخميس",
    "الجمعة",
  ]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Load groups on component mount
  useEffect(() => {
    if (n8nConfig.webhookUrl) {
      loadGroups();
    }
  }, [n8nConfig.webhookUrl]);

  // Load plan types when group changes
  useEffect(() => {
    if (formData.group && n8nConfig.webhookUrl) {
      loadPlanTypes();
    }
  }, [formData.group, n8nConfig.webhookUrl]);

  // Load plan elements when plan type changes
  useEffect(() => {
    if (formData.planType && n8nConfig.webhookUrl) {
      loadPlanElements();
    }
  }, [formData.planType, n8nConfig.webhookUrl]);

  const loadGroups = async () => {
    try {
      setIsLoadingData(true);
      const response = await fetch(n8nConfig.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "getGroups" }),
      });
      
      const data = await response.json();
      setGroups(data.groups || []);
    } catch (error) {
      console.error("Error loading groups:", error);
      toast.error("خطأ في تحميل المجموعات");
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadPlanTypes = async () => {
    try {
      setIsLoadingData(true);
      const response = await fetch(n8nConfig.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "getPlanTypes", group: formData.group }),
      });
      
      const data = await response.json();
      setPlanTypes(data.planTypes || []);
      setFormData(prev => ({ ...prev, planType: "", planElement: "" }));
    } catch (error) {
      console.error("Error loading plan types:", error);
      toast.error("خطأ في تحميل أنواع الخطط");
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadPlanElements = async () => {
    try {
      setIsLoadingData(true);
      const response = await fetch(n8nConfig.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "getPlanElements", 
          planType: formData.planType 
        }),
      });
      
      const data = await response.json();
      setPlanElements(data.planElements || []);
      setFormData(prev => ({ ...prev, planElement: "" }));
    } catch (error) {
      console.error("Error loading plan elements:", error);
      toast.error("خطأ في تحميل عناصر الخطة");
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!n8nConfig.dataWebhookUrl) {
      toast.error("الرجاء إدخال رابط webhook لإرسال البيانات");
      return;
    }

    // Validation
    if (!formData.studentName || !formData.group || !formData.planType || 
        !formData.planElement || !formData.day1 || !formData.day2 ||
        !formData.startDay || !formData.startMonth || !formData.startYear ||
        !formData.planDays) {
      toast.error("الرجاء ملء جميع الحقول");
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(n8nConfig.dataWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: formData.studentName,
          group: formData.group,
          planType: formData.planType,
          planElement: formData.planElement,
          days: [formData.day1, formData.day2],
          startDate: `${formData.startDay}/${formData.startMonth}/${formData.startYear}`,
          planDays: formData.planDays,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        toast.success("تم إرسال البيانات بنجاح!");
        // Reset form
        setFormData({
          studentName: "",
          group: "",
          planType: "",
          planElement: "",
          day1: "",
          day2: "",
          startDay: "",
          startMonth: "",
          startYear: "",
          planDays: "",
        });
      } else {
        toast.error("حدث خطأ أثناء إرسال البيانات");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("حدث خطأ في الاتصال بالخادم");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary/10 rounded-2xl">
              <FileText className="w-12 h-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold gradient-primary bg-clip-text text-transparent">
            نظام إدارة خطط الطلاب
          </h1>
          <p className="text-muted-foreground text-lg">
            نظام متكامل لإدارة خطط الطلاب مع الربط المباشر بـ n8n
          </p>
        </div>

        {/* n8n Configuration Card */}
        <Card className="p-6 shadow-card">
          <h2 className="text-xl font-bold mb-4 text-primary flex items-center gap-2">
            <span className="w-2 h-2 bg-primary rounded-full"></span>
            إعدادات n8n
          </h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="webhookUrl" className="text-base">
                رابط Webhook للبيانات (الحصول على القوائم)
              </Label>
              <Input
                id="webhookUrl"
                type="url"
                placeholder="https://your-n8n-instance.com/webhook/get-data"
                value={n8nConfig.webhookUrl}
                onChange={(e) =>
                  setN8nConfig({ ...n8nConfig, webhookUrl: e.target.value })
                }
                className="mt-2"
                dir="ltr"
              />
              <p className="text-sm text-muted-foreground mt-1">
                هذا الـ webhook يستخدم لجلب بيانات المجموعات والخطط من Google Sheets
              </p>
            </div>
            <div>
              <Label htmlFor="dataWebhookUrl" className="text-base">
                رابط Webhook لإرسال البيانات
              </Label>
              <Input
                id="dataWebhookUrl"
                type="url"
                placeholder="https://your-n8n-instance.com/webhook/submit-data"
                value={n8nConfig.dataWebhookUrl}
                onChange={(e) =>
                  setN8nConfig({ ...n8nConfig, dataWebhookUrl: e.target.value })
                }
                className="mt-2"
                dir="ltr"
              />
              <p className="text-sm text-muted-foreground mt-1">
                هذا الـ webhook يستخدم لإرسال بيانات النموذج عند الضغط على إرسال
              </p>
            </div>
          </div>
        </Card>

        {/* Main Form */}
        <Card className="p-6 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Student Name */}
            <div>
              <Label htmlFor="studentName" className="text-base">
                اسم الطالب <span className="text-destructive">*</span>
              </Label>
              <Input
                id="studentName"
                value={formData.studentName}
                onChange={(e) =>
                  setFormData({ ...formData, studentName: e.target.value })
                }
                placeholder="أدخل اسم الطالب"
                className="mt-2"
              />
            </div>

            {/* Group */}
            <div>
              <Label htmlFor="group" className="text-base">
                المجموعة <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.group}
                onValueChange={(value) =>
                  setFormData({ ...formData, group: value })
                }
                disabled={isLoadingData || groups.length === 0}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="اختر المجموعة" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group} value={group}>
                      {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {groups.length === 0 && (
                <p className="text-sm text-destructive mt-1">
                  الرجاء إدخال رابط webhook أولاً
                </p>
              )}
            </div>

            {/* Plan Type */}
            <div>
              <Label htmlFor="planType" className="text-base">
                نوع الخطة <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.planType}
                onValueChange={(value) =>
                  setFormData({ ...formData, planType: value })
                }
                disabled={isLoadingData || !formData.group || planTypes.length === 0}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="اختر نوع الخطة" />
                </SelectTrigger>
                <SelectContent>
                  {planTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Plan Element */}
            <div>
              <Label htmlFor="planElement" className="text-base">
                عنصر الخطة <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.planElement}
                onValueChange={(value) =>
                  setFormData({ ...formData, planElement: value })
                }
                disabled={isLoadingData || !formData.planType || planElements.length === 0}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="اختر عنصر الخطة" />
                </SelectTrigger>
                <SelectContent>
                  {planElements.map((element) => (
                    <SelectItem key={element} value={element}>
                      {element}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Days */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="day1" className="text-base">
                  اليوم الأول <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.day1}
                  onValueChange={(value) =>
                    setFormData({ ...formData, day1: value })
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="اختر اليوم الأول" />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map((day) => (
                      <SelectItem key={day} value={day}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="day2" className="text-base">
                  اليوم الثاني <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.day2}
                  onValueChange={(value) =>
                    setFormData({ ...formData, day2: value })
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="اختر اليوم الثاني" />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map((day) => (
                      <SelectItem key={day} value={day}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Start Date */}
            <div>
              <Label className="text-base">
                تاريخ بدء الخطة <span className="text-destructive">*</span>
              </Label>
              <div className="grid grid-cols-3 gap-4 mt-2">
                <div>
                  <Input
                    type="number"
                    placeholder="اليوم"
                    min="1"
                    max="31"
                    value={formData.startDay}
                    onChange={(e) =>
                      setFormData({ ...formData, startDay: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    placeholder="الشهر"
                    min="1"
                    max="12"
                    value={formData.startMonth}
                    onChange={(e) =>
                      setFormData({ ...formData, startMonth: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    placeholder="السنة"
                    min="2020"
                    max="2100"
                    value={formData.startYear}
                    onChange={(e) =>
                      setFormData({ ...formData, startYear: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Plan Days */}
            <div>
              <Label htmlFor="planDays" className="text-base">
                عدد أيام الخطة <span className="text-destructive">*</span>
              </Label>
              <Input
                id="planDays"
                type="number"
                min="1"
                value={formData.planDays}
                onChange={(e) =>
                  setFormData({ ...formData, planDays: e.target.value })
                }
                placeholder="أدخل عدد الأيام"
                className="mt-2"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full gradient-primary text-lg py-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <Send className="ml-2 h-5 w-5" />
                  إرسال البيانات
                </>
              )}
            </Button>
          </form>
        </Card>

        {/* Instructions */}
        <Card className="p-6 bg-muted/50">
          <h3 className="font-bold text-lg mb-3">تعليمات الاستخدام:</h3>
          <ol className="space-y-2 text-muted-foreground list-decimal list-inside">
            <li>قم بإدخال روابط n8n webhooks في الأعلى</li>
            <li>سيتم تحميل المجموعات تلقائياً</li>
            <li>عند اختيار المجموعة، سيتم تحميل أنواع الخطط</li>
            <li>عند اختيار نوع الخطة، سيتم تحميل عناصر الخطة</li>
            <li>املأ باقي الحقول ثم اضغط إرسال</li>
          </ol>
        </Card>
      </div>
    </div>
  );
};

export default StudentPlanForm;
