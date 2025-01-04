import { useForm } from "react-hook-form";

type FormValues = {
  question: string;
  name: string;
  subscribe: boolean;
  email: string;
};

export const AskAQuestionForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<FormValues>({
    defaultValues: {
      subscribe: true,
    },
  });
  const subscribe = watch("subscribe");

  const onSubmit = async (data: FormValues) => {
    try {
      await fetch("/api/ask", {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (e) {
      setError("root", {
        type: "server",
        message:
          "An error occurred while submitting your question. Please try again later.",
      });
    }
  };

  return (
    <>
      {isSubmitSuccessful && (
        <div className="flex flex-col items-center gap-8 p-32">
          <svg
            className="w-32 h-32"
            xmlns="http://www.w3.org/2000/svg"
            height="511.67482"
            viewBox="0 0 570 511.67482"
            role="img"
          >
            <path
              d="M879.99927,389.83741a.99678.99678,0,0,1-.5708-.1792L602.86963,197.05469a5.01548,5.01548,0,0,0-5.72852.00977L322.57434,389.65626a1.00019,1.00019,0,0,1-1.14868-1.6377l274.567-192.5918a7.02216,7.02216,0,0,1,8.02-.01318l276.55883,192.603a1.00019,1.00019,0,0,1-.57226,1.8208Z"
              transform="translate(-315 -194.16259)"
              fill="#3f3d56"
            />
            <polygon
              points="23.264 202.502 285.276 8.319 549.276 216.319 298.776 364.819 162.776 333.819 23.264 202.502"
              fill="#e6e6e6"
            />
            <path
              d="M489.25553,650.70367H359.81522a6.04737,6.04737,0,1,1,0-12.09473H489.25553a6.04737,6.04737,0,1,1,0,12.09473Z"
              transform="translate(-315 -194.16259)"
              fill="#6c63ff"
            />
            <path
              d="M406.25553,624.70367H359.81522a6.04737,6.04737,0,1,1,0-12.09473h46.44031a6.04737,6.04737,0,1,1,0,12.09473Z"
              transform="translate(-315 -194.16259)"
              fill="#6c63ff"
            />
            <path
              d="M603.96016,504.82207a7.56366,7.56366,0,0,1-2.86914-.562L439.5002,437.21123v-209.874a7.00817,7.00817,0,0,1,7-7h310a7.00818,7.00818,0,0,1,7,7v210.0205l-.30371.12989L606.91622,504.22734A7.61624,7.61624,0,0,1,603.96016,504.82207Z"
              transform="translate(-315 -194.16259)"
              fill="#fff"
            />
            <path
              d="M603.96016,505.32158a8.07177,8.07177,0,0,1-3.05957-.59863L439.0002,437.54521v-210.208a7.50851,7.50851,0,0,1,7.5-7.5h310a7.50851,7.50851,0,0,1,7.5,7.5V437.68779l-156.8877,66.999A8.10957,8.10957,0,0,1,603.96016,505.32158Zm-162.96-69.1123,160.66309,66.66455a6.1182,6.1182,0,0,0,4.668-.02784l155.669-66.47851V227.33721a5.50653,5.50653,0,0,0-5.5-5.5h-310a5.50653,5.50653,0,0,0-5.5,5.5Z"
              transform="translate(-315 -194.16259)"
              fill="#3f3d56"
            />
            <path
              d="M878,387.83741h-.2002L763,436.85743l-157.06982,67.07a5.06614,5.06614,0,0,1-3.88038.02L440,436.71741l-117.62012-48.8-.17968-.08H322a7.00778,7.00778,0,0,0-7,7v304a7.00779,7.00779,0,0,0,7,7H878a7.00779,7.00779,0,0,0,7-7v-304A7.00778,7.00778,0,0,0,878,387.83741Zm5,311a5.002,5.002,0,0,1-5,5H322a5.002,5.002,0,0,1-5-5v-304a5.01106,5.01106,0,0,1,4.81006-5L440,438.87739l161.28027,66.92a7.12081,7.12081,0,0,0,5.43994-.03L763,439.02741l115.2002-49.19a5.01621,5.01621,0,0,1,4.7998,5Z"
              transform="translate(-315 -194.16259)"
              fill="#3f3d56"
            />
            <path
              d="M602.345,445.30958a27.49862,27.49862,0,0,1-16.5459-5.4961l-.2959-.22217-62.311-47.70752a27.68337,27.68337,0,1,1,33.67407-43.94921l40.36035,30.94775,95.37793-124.38672a27.68235,27.68235,0,0,1,38.81323-5.12353l-.593.80517.6084-.79346a27.71447,27.71447,0,0,1,5.12353,38.81348L624.36938,434.50586A27.69447,27.69447,0,0,1,602.345,445.30958Z"
              transform="translate(-315 -194.16259)"
              fill="#6c63ff"
            />
          </svg>
          <div className=" flex flex-col items-center text-center gap-2">
            <p className="dark:text-white text-2xl text-center font-bold max-w-md">
              Thanks for submitting your question!
            </p>
            <p className="dark:text-white text-md text-center">
              I will read it as soon as possible and, demand and availability
              permitting, I will try to answer it in an upcoming issue of the
              iOS CI Newsletter.
            </p>
          </div>

          <button
            onClick={() => reset()}
            className="text-white disabled:opacity-50 bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:outline-none focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-800 transition-colors"
          >
            Submit another question
          </button>
        </div>
      )}
      {!isSubmitSuccessful && (
        <form
          className="w-full min-w-52 space-y-8"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="space-y-4">
            <label
              htmlFor="question"
              className="block text-lg font-medium text-gray-900 dark:text-white"
            >
              Ask your question <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register("question", {
                required: {
                  value: true,
                  message: "Please enter your question.",
                },
                minLength: 10,
              })}
              id="question"
              rows={4}
              className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-purple-500 dark:focus:border-purple-500"
              placeholder="How can I automate my app's signing process on CI/CD?"
            ></textarea>
            {errors.question && (
              <p className="text-red-500 text-sm">{errors.question.message}</p>
            )}
          </div>

          <div className="space-y-4">
            <label
              htmlFor="name"
              className="block text-lg font-medium text-gray-900 dark:text-white"
            >
              Your name
            </label>
            <input
              type="text"
              {...register("name")}
              id="name"
              className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-purple-500 dark:focus:border-purple-500 dark:shadow-sm-light"
              placeholder="John Doe"
            />
            <p className="dark:text-white/60 text-black/60 text-sm">
              This is optional, only provide your name if you'd like to be
              mentioned in the answer.
            </p>
          </div>

          <div className="flex items-center mb-4">
            <input
              id="checkbox-1"
              type="checkbox"
              {...register("subscribe")}
              className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label
              htmlFor="checkbox-1"
              className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
            >
              I would like to subscribe to the iOS CI Newsletter to hear about
              the answer.
            </label>
          </div>

          {subscribe && (
            <div className="space-y-4">
              <label
                htmlFor="email-address-icon"
                className="block text-lg font-medium text-gray-900 dark:text-white"
              >
                Your Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-500 dark:text-gray-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 16"
                  >
                    <path d="m10.036 8.278 9.258-7.79A1.979 1.979 0 0 0 18 0H2A1.987 1.987 0 0 0 .641.541l9.395 7.737Z"></path>
                    <path d="M11.241 9.817c-.36.275-.801.425-1.255.427-.428 0-.845-.138-1.187-.395L0 2.6V14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2.5l-8.759 7.317Z"></path>
                  </svg>
                </div>
                <input
                  {...register("email", {
                    pattern: {
                      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
                      message: "Please enter a valid email address.",
                    },
                    required: {
                      value: subscribe,
                      message:
                        "Please enter your email address if you would like to subscribe to the newsletter.",
                    },
                  })}
                  type="text"
                  id="email-address-icon"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-purple-500 dark:focus:border-purple-500"
                  placeholder="name@flowbite.com"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="text-white disabled:opacity-50 bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:outline-none focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-800 transition-colors"
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
          {errors.root && (
            <p className="text-red-500 text-sm">{errors.root.message}</p>
          )}
        </form>
      )}
    </>
  );
};
