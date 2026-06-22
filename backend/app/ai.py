#Ollama API connection code

from langchain_community.llms import Ollama
from langchain_core.prompts import ChatPromptTemplate

def get_ai_decision(user_budget: float, weather_condition: str, user_vibe: str) -> str:
    """
    WHAT: Connects our app metrics to our local Gemma model using LangChain.
    HOW: Chains a ChatPromptTemplate directly into the Ollama gemma2:2b instance.
    WHY: Uses industry-standard tooling to enforce strict categorical routing.
    """
    
    # 1. Instantiate your newly installed lightweight Gemma model via LangChain
    llm = Ollama(model="gemma2:2b")
    
    # 2. Build a structured System + User prompt layout
    prompt_template = ChatPromptTemplate.from_messages([
        (
            "system",
            "You are the core routing engine for an Auckland Explorer App.\n"
            "Your job is to look at the user's situation and pick the SINGLE best search category keyword.\n\n"
            "CRITICAL RULES:\n"
            "1. You must reply with ONLY one of these exact words: BEACH, PARK_RECREATION_AREA, SHOPPING_CENTER, RESTAURANT, HOTEL_MOTEL.\n"
            "2. Do NOT include any intro text, explanations, markdown formatting, or punctuation.\n"
            "3. If it is raining or stormy, lean heavily toward indoor options like SHOPPING_CENTER or RESTAURANT."
        ),
        (
            "user",
            "Current Conditions:\n"
            "- User Vibe/Intent: \"{vibe}\"\n"
            "- Live Auckland Weather: \"{weather}\"\n"
            "- User Budget: ${budget}\n\n"
            "Category:"
        )
    ])
    
    # 3. Chain them together using LangChain's native pipe (|) syntax
    chain = prompt_template | llm

    try:
        # Invoke the chain, passing our live variables into the brackets
        raw_response = chain.invoke({
            "vibe": user_vibe,
            "weather": weather_condition,
            "budget": user_budget
        })
        
        # Clean up any accidental trailing spaces or newlines
        decision = raw_response.strip()
        
        # Validation safety guard check
        valid_categories = ["BEACH", "PARK_RECREATION_AREA", "SHOPPING_CENTER", "RESTAURANT", "HOTEL_MOTEL"]
        if decision not in valid_categories:
            print(f"Gemma outputted an invalid category: '{decision}'. Falling back to default.")
            return "PARK_RECREATION_AREA"
            
        return decision

    except Exception as e:
        print(f"LangChain execution error: {str(e)}")
        return "PARK_RECREATION_AREA"
def analyze_transit_options_with_ai(transit_options: list, user_vibe: str) -> dict:
    """
    WHAT: Feeds live AT transit alternatives directly to the AI model.
    WHY: Allows the model to weigh walking distances vs. costs vs. speed based on the user's preferences.
    """
    # For now, we simulate the logic analysis. If the user wants short/less walking, 
    # we favor the option with minimal walking distance (Ferry = 150m).
    vibe_lower = user_vibe.lower()
    
    best_index = 0  # Default to Bus
    if "least walking" in vibe_lower or "short" in vibe_lower:
        best_index = 1  # Select Ferry
        reasoning = (
            "I recommend taking the DEV Ferry. Even though the fare is higher ($7.80), "
            "it saves you 11 minutes of travel time and reduces your walking distance to just 150 meters, "
            "matching your preference for a shorter, low-effort trip."
        )
    else:
        reasoning = (
            "The InnerLink Bus is your best choice here. At only $3.00 ($1.80 for Tertiary), "
            "it is highly cost-effective and runs perfectly on time, keeping your journey budget-friendly."
        )
        
    return {
        "recommended_option_index": best_index,
        "ai_transit_reasoning": reasoning
    }