import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLogin } from '../hooks';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof schema>;

export function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
  });

  const { mutate: login, isPending, error } = useLogin();

  const onSubmit = (data: LoginFormValues) => {
    login(data);
  };

  // Extract a readable error message if possible
  const apiError = error as any;
  const loginErrorMessage =
    apiError?.response?.data?.message ||
    apiError?.message ||
    'Invalid credentials';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Login Card */}
      <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 w-full max-w-md shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-500 text-3xl shadow-lg shadow-brand-500/20 mb-4 animate-pulse">
            🚌
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Transit<span className="text-brand-500">Ops</span>
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            Fleet Operations Management Platform
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Email Address
            </label>
            <input
              {...register('email')}
              type="email"
              placeholder="fleet@transitops.com"
              className="w-full bg-gray-950/80 border border-gray-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors placeholder:text-gray-600"
            />
            {errors.email && (
              <p className="text-rose-500 text-xs mt-1.5 ml-1">
                ⚠️ {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Password
            </label>
            <input
              {...register('password')}
              type="password"
              placeholder="••••••••"
              className="w-full bg-gray-950/80 border border-gray-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors placeholder:text-gray-600"
            />
            {errors.password && (
              <p className="text-rose-500 text-xs mt-1.5 ml-1">
                ⚠️ {errors.password.message}
              </p>
            )}
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-rose-400 text-sm text-center">
              {loginErrorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white py-3.5 rounded-xl text-sm font-semibold tracking-wider uppercase transition-all shadow-lg shadow-brand-500/20 hover:shadow-brand-500/35 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-800/60 text-center">
          <p className="text-xs text-gray-500">
            For testing: <code className="text-gray-400">password123</code>
          </p>
          <div className="grid grid-cols-2 gap-2 mt-3 text-[10px] text-gray-400">
            <span className="bg-gray-950/60 border border-gray-800 rounded py-1 px-1.5">
              fleet@transitops.com
            </span>
            <span className="bg-gray-950/60 border border-gray-800 rounded py-1 px-1.5">
              driver@transitops.com
            </span>
            <span className="bg-gray-950/60 border border-gray-800 rounded py-1 px-1.5">
              safety@transitops.com
            </span>
            <span className="bg-gray-950/60 border border-gray-800 rounded py-1 px-1.5">
              finance@transitops.com
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
