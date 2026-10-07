import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, LockKeyhole } from "lucide-react";
import Login from "@/assets/lottie/login.json";
import Lottie from "lottie-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Auth() {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    checkUser();
  }, [navigate]);

  // -------------------------
  // LOGIN
  // -------------------------
  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error("Credenciais inválidas", {
        description: "Verifique seu e-mail e senha e tente novamente.",
      });
      setIsLoading(false);
      return;
    }

    toast.success("Login realizado com sucesso!");
    setIsLoading(false);
    navigate("/");
  };

  // -------------------------
  // CREATE ACCOUNT (FUNÇÃO MANTIDA PARA USO FUTURO)
  // -------------------------
  /* 
  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      setIsLoading(false);
      return;
    }

    const redirectUrl = `${window.location.origin}/`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    setSuccess("Conta criada com sucesso! Verifique seu email.");
    setIsLoading(false);
  };
  */

  // -------------------------
  // RETURN DO COMPONENTE
  // -------------------------
  return (
    <div className="relative flex min-h-[100svh] overflow-hidden bg-background">
      {/* Left Panel */}
      <div className="relative hidden overflow-hidden bg-auth-panel lg:flex lg:flex-1 lg:items-center lg:justify-center">

        {/* Container que centraliza + define limite de tamanho */}
        <div className="relative z-10 flex items-center justify-center">
          <Lottie
            animationData={Login}
            loop={true}
            className="h-[min(52vw,520px)] w-[min(52vw,520px)]"
          />
        </div>
      </div>

      {/* Auth Form */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-5 py-8 sm:px-8 lg:w-[500px] lg:flex-none">
        <div className="w-full max-w-[400px]">
          <div className="mb-8 flex flex-col items-center text-center sm:mb-10">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-success text-success-foreground shadow-elevated">
              <DollarSign className="h-9 w-9" />
            </div>
            <h1 className="text-2xl font-bold">Bem-vindo de volta</h1>
            <p className="mt-1 text-sm text-muted-foreground">Acesse sua conta financeira</p>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card/80 p-5 shadow-elevated backdrop-blur-xl sm:p-8">
              {/* LOGIN */}
              <form onSubmit={handleSignIn} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    placeholder="seu@email.com"
                    required
                    disabled={isLoading}
                    className="h-12 bg-muted/50 px-4 text-base sm:text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signin-password">Senha</Label>
                  <Input
                    id="signin-password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                    className="h-12 bg-muted/50 px-4 text-base sm:text-sm"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-12 w-full bg-success font-semibold text-success-foreground shadow-card hover:bg-success/90"
                >
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
              </form>

              {/* SIGNUP - COMENTADO/OCULTO
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Entrar</TabsTrigger>
                  <TabsTrigger value="signup">Criar Conta</TabsTrigger>
                </TabsList>

                <TabsContent value="signup" className="space-y-4">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        name="email"
                        type="email"
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Senha</Label>
                      <Input
                        id="signup-password"
                        name="password"
                        type="password"
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm">Confirmar Senha</Label>
                      <Input
                        id="signup-confirm"
                        name="confirmPassword"
                        type="password"
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-11"
                    >
                      {isLoading ? "Criando conta..." : "Criar Conta"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
              FIM DO SIGNUP COMENTADO */}

          </div>
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <LockKeyhole className="h-4 w-4" />
            <span>Acesso seguro às suas finanças</span>
          </div>
        </div>
      </div>
    </div>
  );
}
