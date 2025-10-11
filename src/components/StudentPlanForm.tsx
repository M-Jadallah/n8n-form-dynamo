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
  center: string;
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
    center: "",
    planType: "",
    planElement: "",
    day1: "",
    day2: "",
    startDay: "",
    startMonth: "",
    startYear: "",
    planDays: "",
  });

  // إعدادات n8n و Google Apps Script مخزنة مباشرة في الكود
  const n8nConfig: N8nConfig = {
    webhookUrl: "https://script.google.com/macros/s/AKfycbwe1sABQ8QAjxiPFH9ydaVVLg3ztMTQU7nGUA01qmEcb5uQ8fn4JXH9POgfkBqkX9cL/exec",
    dataWebhookUrl: "https://n8n.jadallah.work/webhook/formform",
  };

  const [groups, setGroups] = useState<string[]>([]);
  const [centers, setCenters] = useState<string[]>([]);
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

  // Load centers when group changes
  useEffect(() => {
    if (formData.group && n8nConfig.webhookUrl) {
      loadCenters();
    }
  }, [formData.group, n8nConfig.webhookUrl]);

  // Load plan types when center changes
  useEffect(() => {
    if (formData.center && n8nConfig.webhookUrl) {
      loadPlanTypes();
    }
  }, [formData.center, n8nConfig.webhookUrl]);

  // Load plan elements when plan type changes
  useEffect(() => {
    if (formData.planType && n8nConfig.webhookUrl) {
      loadPlanElements();
    }
  }, [formData.planType, n8nConfig.webhookUrl]);

  const loadGroups = async () => {
    try {
      setIsLoadingData(true);
      const url = new URL(n8nConfig.webhookUrl);
      url.searchParams.append('action', 'getGroups');
      
      const response = await fetch(url.toString(), {
        method: "GET",
      });
      
      const data = await response.json();
      console.log("Groups response:", data);
      
      const groupsData = Array.isArray(data.groups) ? data.groups : 
                         Array.isArray(data) ? data : [];
      setGroups(groupsData);
    } catch (error) {
      console.error("Error loading groups:", error);
      toast.error("خطأ في تحميل المجموعات");
      setGroups([]);
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadCenters = async () => {
    try {
      setIsLoadingData(true);
      const url = new URL(n8nConfig.webhookUrl);
      url.searchParams.append('action', 'getCenters');
      url.searchParams.append('group', formData.group);
      
      const response = await fetch(url.toString(), {
        method: "GET",
      });
      
      const data = await response.json();
      console.log("Centers response:", data);
      
      const centersData = Array.isArray(data.centers) ? data.centers : 
                          Array.isArray(data) ? data : [];
      setCenters(centersData);
      setFormData(prev => ({ ...prev, center: "", planType: "", planElement: "" }));
    } catch (error) {
      console.error("Error loading centers:", error);
      toast.error("خطأ في تحميل المراكز");
      setCenters([]);
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadPlanTypes = async () => {
    try {
      setIsLoadingData(true);
      const url = new URL(n8nConfig.webhookUrl);
      url.searchParams.append('action', 'getPlanTypes');
      url.searchParams.append('center', formData.center);
      
      const response = await fetch(url.toString(), {
        method: "GET",
      });
      
      const data = await response.json();
      console.log("Plan types response:", data);
      
      const planTypesData = Array.isArray(data.planTypes) ? data.planTypes : 
                            Array.isArray(data) ? data : [];
      setPlanTypes(planTypesData);
      setFormData(prev => ({ ...prev, planType: "", planElement: "" }));
    } catch (error) {
      console.error("Error loading plan types:", error);
      toast.error("خطأ في تحميل أنواع الخطط");
      setPlanTypes([]);
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadPlanElements = async () => {
    try {
      setIsLoadingData(true);
      const url = new URL(n8nConfig.webhookUrl);
      url.searchParams.append('action', 'getPlanElements');
      url.searchParams.append('planType', formData.planType);
      
      const response = await fetch(url.toString(), {
        method: "GET",
      });
      
      const data = await response.json();
      console.log("Plan elements response:", data);
      
      const planElementsData = Array.isArray(data.planElements) ? data.planElements : 
                               Array.isArray(data) ? data : [];
      setPlanElements(planElementsData);
      setFormData(prev => ({ ...prev, planElement: "" }));
    } catch (error) {
      console.error("Error loading plan elements:", error);
      toast.error("خطأ في تحميل عناصر الخطة");
      setPlanElements([]);
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

    if (!formData.studentName || !formData.group || !formData.center || !formData.planType || 
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
          center: formData.center,
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
        setFormData({
          studentName: "",
          group: "",
          center: "",
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
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 py-12 relative overflow-hidden">
          <div className="absolute inset-0 gradient-primary opacity-5 rounded-3xl"></div>
          <div className="relative">
            <div className="flex justify-center mb-6">
              <div className="p-5 gradient-primary rounded-3xl shadow-elegant animate-in fade-in duration-500">
                <FileText className="w-16 h-16 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-5xl font-bold gradient-primary bg-clip-text text-transparent mb-3 animate-in slide-in-from-bottom-4 duration-700">
              نظام إدارة خطط الطلاب
            </h1>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto animate-in slide-in-from-bottom-4 duration-700 delay-100">
              نظام متكامل وآلي لإدارة وتوزيع خطط الطلاب بكفاءة عالية
            </p>
          </div>
        </div>

        {/* Instructions Card */}
        <Card className="p-8 gradient-card border-2 border-primary/10 shadow-elegant">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-primary/10 rounded-xl">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-2xl mb-4 text-primary">كيفية استخدام النظام</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0 mt-0.5">1</span>
                    <p className="text-muted-foreground leading-relaxed">
                      <strong className="text-foreground">اختر المجموعة:</strong> سيتم تحميل المجموعات تلقائياً
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0 mt-0.5">2</span>
                    <p className="text-muted-foreground leading-relaxed">
                      <strong className="text-foreground">اختر المركز:</strong> حدد المركز المطلوب
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0 mt-0.5">3</span>
                    <p className="text-muted-foreground leading-relaxed">
                      <strong className="text-foreground">نوع الخطة:</strong> اختر نوع الخطة المناسبة
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0 mt-0.5">4</span>
                    <p className="text-muted-foreground leading-relaxed">
                      <strong className="text-foreground">عنصر الخطة:</strong> حدد العنصر المطلوب
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0 mt-0.5">5</span>
                    <p className="text-muted-foreground leading-relaxed">
                      <strong className="text-foreground">أيام الدراسة:</strong> اختر اليومين المخصصين
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0 mt-0.5">6</span>
                    <p className="text-muted-foreground leading-relaxed">
                      <strong className="text-foreground">إرسال:</strong> اضغط على زر الإرسال لحفظ البيانات
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {isLoadingData && (
            <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
              <span className="text-sm text-muted-foreground">جاري تحميل البيانات من Google Sheets...</span>
            </div>
          )}
        </Card>

        {/* Main Form */}
        <Card className="p-8 shadow-elegant border-2 border-primary/10">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-primary flex items-center gap-3">
              <div className="w-1 h-8 bg-primary rounded-full"></div>
              بيانات الطالب والخطة
            </h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Student Name */}
            <div className="space-y-2">
              <Label htmlFor="studentName" className="text-base font-semibold flex items-center gap-2">
                <span className="text-primary">●</span>
                اسم الطالب <span className="text-destructive">*</span>
              </Label>
              <Input
                id="studentName"
                value={formData.studentName}
                onChange={(e) =>
                  setFormData({ ...formData, studentName: e.target.value })
                }
                placeholder="أدخل اسم الطالب الكامل"
                className="mt-2 h-12 text-base border-2 focus:border-primary"
                required
              />
            </div>

            {/* Group */}
            <div className="space-y-2">
              <Label htmlFor="group" className="text-base font-semibold flex items-center gap-2">
                <span className="text-primary">●</span>
                المجموعة <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.group}
                onValueChange={(value) =>
                  setFormData({ ...formData, group: value })
                }
                disabled={isLoadingData || groups.length === 0}
                required
              >
                <SelectTrigger className="mt-2 h-12 text-base border-2 focus:border-primary">
                  <SelectValue placeholder={groups.length === 0 ? "جاري التحميل..." : "اختر المجموعة"} />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {groups.map((group) => (
                    <SelectItem key={group} value={group} className="text-base">
                      {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Center */}
            <div className="space-y-2">
              <Label htmlFor="center" className="text-base font-semibold flex items-center gap-2">
                <span className="text-primary">●</span>
                المركز المطلوب <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.center}
                onValueChange={(value) =>
                  setFormData({ ...formData, center: value })
                }
                disabled={isLoadingData || !formData.group || centers.length === 0}
                required
              >
                <SelectTrigger className="mt-2 h-12 text-base border-2 focus:border-primary">
                  <SelectValue placeholder={!formData.group ? "اختر المجموعة أولاً" : centers.length === 0 ? "جاري التحميل..." : "اختر المركز"} />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {centers.map((center) => (
                    <SelectItem key={center} value={center} className="text-base">
                      {center}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Plan Type */}
            <div className="space-y-2">
              <Label htmlFor="planType" className="text-base font-semibold flex items-center gap-2">
                <span className="text-primary">●</span>
                نوع الخطة <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.planType}
                onValueChange={(value) =>
                  setFormData({ ...formData, planType: value })
                }
                disabled={isLoadingData || !formData.center || planTypes.length === 0}
                required
              >
                <SelectTrigger className="mt-2 h-12 text-base border-2 focus:border-primary">
                  <SelectValue placeholder={!formData.center ? "اختر المركز أولاً" : planTypes.length === 0 ? "جاري التحميل..." : "اختر نوع الخطة"} />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {planTypes.map((type) => (
                    <SelectItem key={type} value={type} className="text-base">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Plan Element */}
            <div className="space-y-2">
              <Label htmlFor="planElement" className="text-base font-semibold flex items-center gap-2">
                <span className="text-primary">●</span>
                عنصر الخطة <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.planElement}
                onValueChange={(value) =>
                  setFormData({ ...formData, planElement: value })
                }
                disabled={isLoadingData || !formData.planType || planElements.length === 0}
                required
              >
                <SelectTrigger className="mt-2 h-12 text-base border-2 focus:border-primary">
                  <SelectValue placeholder={!formData.planType ? "اختر نوع الخطة أولاً" : planElements.length === 0 ? "جاري التحميل..." : "اختر عنصر الخطة"} />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {planElements.map((element) => (
                    <SelectItem key={element} value={element} className="text-base">
                      {element}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Days */}
            <div className="space-y-4">
              <Label className="text-base font-semibold flex items-center gap-2">
                <span className="text-primary">●</span>
                أيام الدراسة <span className="text-destructive">*</span>
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="day1" className="text-sm text-muted-foreground">
                    اليوم الأول
                  </Label>
                  <Select
                    value={formData.day1}
                    onValueChange={(value) =>
                      setFormData({ ...formData, day1: value })
                    }
                    required
                  >
                    <SelectTrigger className="h-12 text-base border-2 focus:border-primary">
                      <SelectValue placeholder="اختر اليوم الأول" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      {days.map((day) => (
                        <SelectItem key={day} value={day} className="text-base">
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="day2" className="text-sm text-muted-foreground">
                    اليوم الثاني
                  </Label>
                  <Select
                    value={formData.day2}
                    onValueChange={(value) =>
                      setFormData({ ...formData, day2: value })
                    }
                    required
                  >
                    <SelectTrigger className="h-12 text-base border-2 focus:border-primary">
                      <SelectValue placeholder="اختر اليوم الثاني" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      {days.map((day) => (
                        <SelectItem key={day} value={day} className="text-base">
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Start Date */}
            <div className="space-y-4">
              <Label className="text-base font-semibold flex items-center gap-2">
                <span className="text-primary">●</span>
                تاريخ بداية تنفيذ الخطة <span className="text-destructive">*</span>
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDay" className="text-sm text-muted-foreground">
                    اليوم
                  </Label>
                  <Input
                    id="startDay"
                    type="number"
                    min="1"
                    max="31"
                    value={formData.startDay}
                    onChange={(e) =>
                      setFormData({ ...formData, startDay: e.target.value })
                    }
                    placeholder="1-31"
                    className="h-12 text-base border-2 focus:border-primary"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startMonth" className="text-sm text-muted-foreground">
                    الشهر
                  </Label>
                  <Input
                    id="startMonth"
                    type="number"
                    min="1"
                    max="12"
                    value={formData.startMonth}
                    onChange={(e) =>
                      setFormData({ ...formData, startMonth: e.target.value })
                    }
                    placeholder="1-12"
                    className="h-12 text-base border-2 focus:border-primary"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startYear" className="text-sm text-muted-foreground">
                    السنة
                  </Label>
                  <Input
                    id="startYear"
                    type="number"
                    min="2024"
                    value={formData.startYear}
                    onChange={(e) =>
                      setFormData({ ...formData, startYear: e.target.value })
                    }
                    placeholder="2024"
                    className="h-12 text-base border-2 focus:border-primary"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Plan Days */}
            <div className="space-y-2">
              <Label htmlFor="planDays" className="text-base font-semibold flex items-center gap-2">
                <span className="text-primary">●</span>
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
                placeholder="أدخل عدد أيام الخطة"
                className="mt-2 h-12 text-base border-2 focus:border-primary"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="ml-2 h-6 w-6 animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <Send className="ml-2 h-6 w-6" />
                    إرسال البيانات
                  </>
                )}
              </Button>
              <p className="text-center text-sm text-muted-foreground mt-3">
                سيتم حفظ البيانات وإرسالها تلقائياً إلى النظام
              </p>
            </div>
          </form>
        </Card>

        {/* Technical Info */}
        <Card className="p-6 bg-muted/30 border border-primary/10">
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            ملاحظة فنية
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            النظام متصل تلقائياً بـ Google Sheets و n8n لمعالجة البيانات وحفظها بشكل آمن ومنظم
          </p>
        </Card>
      </div>
    </div>
  );
};

export default StudentPlanForm;
